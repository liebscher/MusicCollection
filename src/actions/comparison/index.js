import * as consts from '../../constants/comparison'

export const getAlbumComparisonSuccess = (albums) => ({
  type: consts.GET_ALBUM_COMPARISON_SUCCESS,
  albums
})

export function postAlbumComparison(albums, sid1, sid2, category) {

  return dispatch => {

    fetch('/comparison', {
      method: 'POST',
      mode: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({sid1: sid1, sid2: sid2, cat: category})
    })
    .then(resp => {
      dispatch(getAlbumComparisonSuccess(albums))
    })
  }
}
