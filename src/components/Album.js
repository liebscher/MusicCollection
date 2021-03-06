import React, { useState } from 'react'
import { connect } from 'react-redux'
import { CATEGORIES } from '../constants/collection'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeadphones, faEdit, faTimes, faAward, faThumbsDown } from '@fortawesome/free-solid-svg-icons'
import { faFolderOpen, faCompass } from '@fortawesome/free-regular-svg-icons'

import { postReview,
  postTrackReview,
  postListen,
  setAlbumView,
  deleteAlbum,
  postAlbumCatg,
  deleteAlbumCatg,
  resetFilters,
  postCacheArt } from '../actions/collection'

var moment = require('moment');

// an interface to simply view the review from the API
const Review = ({listen, edit, review, hidden}) => (
  <div className={`tab-review ${hidden ? "is-hidden" : ""}`}>
    <p>
      {review}
    </p>
    <p className="listened button is-link is-outlined" onClick={() => listen()}>
      <span>Add Listen</span>
      <FontAwesomeIcon icon={faHeadphones} pull="right"/>
    </p>
    <p className="edit button is-link is-outlined" onClick={() => edit()}>
      <span>Edit Review</span>
      <FontAwesomeIcon icon={faEdit} pull="right"/>
    </p>
  </div>
)

// an interface to edit the review. should send new review back to API
const ReviewEdit = ({post, rev, hidden}) => {

  const [review, setReview] = useState(rev)

  return (
    <div className={`tab-review ${hidden ? "is-hidden" : ""}`}>
      <textarea className="textarea" value={review} onChange={e => setReview(e.target.value)}/>
      <p className="save button is-link is-outlined" onClick={() => post(review)}>
        Save
      </p>
    </div>
  )
}

const duration = (v) => {
  if (moment.duration(v).asMinutes() < 60) {
    return moment.utc(moment.duration(v).asMilliseconds()).format('mm:ss')
  }
  return moment.utc(moment.duration(v).asMilliseconds()).format('h:mm:ss')
}

const Track = ({data, edit}) => {

  const [editing, setEditing] = useState(false)
  const [review, setReview] = useState(data.get(4))
  // const [audio, setAudio] = useState({
  //   clip: new Audio(data[3]),
  //   playing: false
  // })

  function toggleEdit() {
    if (editing) {
      edit(review)
      setEditing(false)
    } else {
      setEditing(true)
    }
  }

  // function togglePreview() {
  //   if (audio.clip.paused) {
  //     audio.clip.volume = 0.5
  //     audio.clip.play()
  //     setAudio({
  //       clip: audio.clip,
  //       playing: true
  //     })
  //   } else {
  //     audio.clip.pause()
  //     setAudio({
  //       clip: audio.clip,
  //       playing: false
  //     })
  //   }
  // }
  //
  // const btnColor = audio.playing ? "track-playing" : "track-paused"
  //
  // <span onClick={togglePreview} className={btnColor}><i className="fas fa-volume-up"></i></span>

  return (
    <div className="track">
      <div className="track-details">
        <div>
          {data.get(0)}.
        </div>
        <div>
          {data.get(1)}
        </div>
        <div>
          {duration(data.get(2))}
        </div>
        <div>
          <FontAwesomeIcon icon={faEdit} onClick={toggleEdit} />
        </div>
      </div>
      {
        editing ?
        ( <div className="track-rev"><input className="input is-small" value={review} onChange={(e) => setReview(e.target.value)}/></div> ) :
        ( <div className="track-rev">{review}</div> )
      }
    </div>
  )
}

// an interface to view tracks and their own reviews from API
const TrackList = ({edit, tracks, hidden}) => (
  <div className={`tab-tracks ${hidden ? "is-hidden" : ""}`}>
    {tracks.map((v, ix) => ( <Track data={v} edit={(review) => edit(ix, review)}/> ))}
  </div>
)

// an interface to view the action history
const History = ({history, hidden}) => (
  <div className={`tab-history ${hidden ? "is-hidden" : ""}`}>
    {history.map(value => {
      return (
        <div className="history-cell">
          <div>{value[0]}</div>
          <div>{value[1]}</div>
        </div>
      )
    })}
  </div>
)

const Options = ({album, popularity, categories, inc, exc, del, hidden}) => (
  <div className={`tab-options ${hidden ? "is-hidden" : ""}`}>
    <div className="popbar">
      <div className="pop">Popularity:</div>
      <progress className="progress is-medium is-link" value={popularity} max="100">{popularity}%</progress>
    </div>
    <div className="album-catgs">
    {CATEGORIES.map(x => {
      let score = album.has('score_'+x) ? album.get('score_'+x).toFixed(2) : 'NA'
      let a = categories.includes(x)
      return <span className={`catg is-capitalized ${a ? "catg-on" : ""}`} onClick={() => a ? exc(x) : inc(x)} key={x}>{x} ({score})</span>
    })}
    </div>
    <p className="button is-outlined is-danger" onClick={() => del()}>
      <span>Delete Album</span>
      <FontAwesomeIcon icon={faTimes} pull="right"/>
    </p>
  </div>
)

const Genres = ({genres}) => {
  return (
    <p className="is-capitalized genres">
      <FontAwesomeIcon icon={faFolderOpen} color="#5e5e5e"/> <span>{genres.join(', ')}</span>
    </p>
  )
}

const Album = (props) => {
  const sid = props.sid
  const albumN = props.albums.get('allSIDs').count()
  const album = props.albums.getIn(['bySID', sid])

  const v = album.get('view')

  const text_history = album.get('history').map(ts => ["Listen", moment(ts, 'X').fromNow()]).toJS()
  text_history.unshift(["Add", moment(album.get('add_date'), 'X').fromNow()])

  const genres = album.get('genres').isEmpty() ? ["Not Classified"] : album.get('genres')

  if (!album.get('cached_art')) {
    props.cacheArt(sid)
  }

  const avg_score = album.get("avg_score") ? album.get("avg_score").toFixed(2) : 0

  const art = album.get('cached_art') ? 'images/' + album.get('sid') + '.png' : album.get('art')

  const dispAward = (color) => (<FontAwesomeIcon icon={faAward} className={color} />)
  const dispThumb = (color) => (<FontAwesomeIcon icon={faThumbsDown} className={color} />)
  const rank = album.get('avg_score_rank')
  let icon = null
  if (rank <= 3) {
    icon = dispAward(["award-gold", "award-silver", "award-bronze"][rank-1])
  } else if (albumN - rank <= 2) {
    icon = dispThumb(["thumb-last", "thumb-2last", "thumb-3last"][albumN - rank])
  }

  return (
    <article className="album" sid={sid}>
      <div className="album-static">
        <figure className="album-art">
          <p className="image">
            <img src={art} alt={sid}/>
          </p>
        </figure>
        <div className="album-content">
          <div className="blur-container">
            <img src={art} className="blur-image"/>
          </div>
          <div className="album-header">
            <h1 className="title album-title">{album.get('album')}</h1>
            <h6 className="subtitle is-6 album-subtitle">{album.get('artist')} — {album.get('year')} {icon}</h6>
            <div className="album-desc">
              <span>{duration(album.get('runtime'))}</span> <span>{avg_score} (#{rank})</span> <span><a href={album.get('url')} target="_blank">Listen</a></span>
              <Genres genres={genres} />
              <FontAwesomeIcon icon={faCompass} color="#5e5e5e"/> <span className="recommended">{Math.trunc(album.get('recommended_score').toFixed(2)*100)}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="album-tabs">
        <div className={(v === "r" || v === "e") ? "album-tab album-tab-active" : "album-tab"} onClick={() => props.setView(sid, "r")}>OVERALL</div>
        <div className={v === "t" ? "album-tab album-tab album-tab-active" : "album-tab"} onClick={() => props.setView(sid, "t")}>TRACKS</div>
        <div className={v === "h" ? "album-tab album-tab-active" : "album-tab"} onClick={() => props.setView(sid, "h")}>HISTORY</div>
        <div className={v === "o" ? "album-tab album-tab-active" : "album-tab"} onClick={() => props.setView(sid, "o")}>OPTIONS</div>
      </div>

      <ReviewEdit
        post={(t) => { props.postReview(sid, t); props.setView(sid, "r")}}
        rev={album.get('review')}
        hidden={v === "e" ? false : true}/>
      <Review
        listen={() => { props.postListen(sid); props.setView(sid, "h") }}
        edit={() => props.setView(sid, "e")}
        review={album.get('review')}
        hidden={v === "r" ? false : true}/>
      <TrackList
        edit={(tid, t) => props.postTrackReview(sid, tid, t)}
        tracks={album.get('tracks')}
        hidden={v === "t" ? false : true}/>
      <History
        history={text_history}
        hidden={v === "h" ? false : true}/>
      <Options
        album={album}
        popularity={album.get('popularity')}
        categories={album.get('catg_inc') === undefined ? [] : album.get('catg_inc')}
        inc={(cat) => props.incCatg(sid, cat)}
        exc={(cat) => props.excCatg(sid, cat)}
        del={() => props.deleteAlbum(sid)}
        hidden={v === "o" ? false : true}/>
    </article>
  )
}

const mapStateToProps = state => ({
  albums: state.collection.get('albums')
});

const mapDispatchToProps = dispatch => ({
  setView: (sid, view) => dispatch(setAlbumView(sid, view)),
  postReview: (sid, review) => dispatch(postReview(sid, review)),
  postTrackReview: (sid, tid, review) => dispatch(postTrackReview(sid, tid, review)),
  postListen: (sid) => dispatch(postListen(sid)),
  deleteAlbum: (sid) => {
    dispatch(deleteAlbum(sid))
    dispatch(resetFilters())
  },
  incCatg: (sid, cat) => dispatch(postAlbumCatg(sid, cat)),
  excCatg: (sid, cat) => dispatch(deleteAlbumCatg(sid, cat)),
  cacheArt: (sid, url) => dispatch(postCacheArt(sid, url))
})

export default connect(mapStateToProps, mapDispatchToProps)(Album)
