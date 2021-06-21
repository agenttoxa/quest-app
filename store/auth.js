export const state = () => {
  return {
    isLogin: false
  }
}

export const mutations = {
  setIsLogin (state, isLogin) {
    state.isLogin = isLogin
  }
}
