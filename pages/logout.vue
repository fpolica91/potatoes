<template>
  <v-layout column justify-center align-center>
    <img class="login__logo" src="/img/logo.png">
    <v-card class="login__card">
      <v-card-text class="login__card-text">
        <!-- Controls -->
        <v-flex sm12 md12 class="login__card-controls">
          <v-btn color="primary" dark large @click="login({ refresh: false })">
            <v-icon style="margin-right: 8px">
              login
            </v-icon>
            Login
          </v-btn>
        </v-flex>
      </v-card-text>
    </v-card>
  </v-layout>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapState, mapGetters, mapActions } = createNamespacedHelpers('auth') // eslint-disable-line

export default {
  data: () => ({}),
  computed: {
    ...mapState(['user']),
    ...mapGetters(['isAuth'])
  },
  mounted() {
    if (this.isAuth) {
      this.$store.dispatch('auth/logout')
      this.$router.push('/')
    }
  },
  methods: {
    ...mapActions(['login'])
  }
}
</script>

<style>
.login {
 width: 256px;
}
.login__logo {
  max-width: 320px;
  margin: 0 0 32px 0;
}
.login__card {
  height: auto;
  width: auto;
  padding: 16px;
  background-color: unset !important;
  box-shadow: unset !important;
}
.login__card-logo {
  margin: 0;
}
.login__card-text {
  margin-top: 0;
}
.login__card-controls {
  margin-top: 0;
  text-align: center;
}

@media only screen and (min-width: 328px) {
  .login__logo {
    max-width: 332px;
    margin: 0 0 32px 0;
  }
}

@media only screen and (min-width: 1024px) {
  .login__card {
    height: auto;
    width: 372px;
    padding: 0 16px;
  }
  .login__card-text {
    margin-top: 16px;
  }
  .login__card-controls {
    margin-top: -8px;
    text-align: center;
  }
}
</style>
