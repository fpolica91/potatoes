<template>
  <div :class="[loader, loaderLayer]">
    <div :class="loaderOverlay" class="loader-overlay" />
    <div v-if="initializing" :class="loaderInit" class="sk-cube-grid">
      <div class="sk-cube sk-cube1" />
      <div class="sk-cube sk-cube2" />
      <div class="sk-cube sk-cube3" />
      <div class="sk-cube sk-cube4" />
      <div class="sk-cube sk-cube5" />
      <div class="sk-cube sk-cube6" />
      <div class="sk-cube sk-cube7" />
      <div class="sk-cube sk-cube8" />
      <div class="sk-cube sk-cube9" />
      <span class="sk-cube-text">
        Loading...
      </span>
    </div>

    <div v-show="saving" :class="loaderSave" class="spinner">
      <div class="cube1" />
      <div class="cube2" />
      <span class="spinner-text">
        Loading...
      </span>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    initializing: false,
    saving: false,
    loading: false
  }),
  computed: {
    isMobile() {
      return this.windowSize < 1280
    },
    loader() {
      return this.loading ? 'loader' : 'loader--hidden'
    },
    loaderLayer() {
      if ((this.initializing && !this.saving) || (!this.initializing && this.saving)) {
        return 'loader--front'
      }
      return 'loader--back'
    },
    loaderOverlay() {
      if ((this.initializing && !this.saving)) {
        return 'loader-overlay--init'
      }
      return 'loader-overlay--save'
    },
    loaderInit() {
      return this.isMobile ? 'sk-cube-grid--no-margin' : 'sk-cube-grid--margin'
    },
    loaderSave() {
      return this.isMobile ? 'spinner--no-margin' : 'spinner--margin'
    }
  },
  mounted() {
    this.windowSize = window.innerWidth
    window.addEventListener('resize', () => {
      this.windowSize = window.innerWidth
    })
  },
  methods: {
    start(payload) {
      if (payload !== undefined) {
        this.initializing = payload.init
        this.saving = payload.save
      }
      this.loading = true
    },
    finish(payload) {
      if (payload !== undefined) {
        this.initializing = payload.init
        this.saving = payload.save
      }
      this.loading = false
    }
  }
}
</script>

<style>
.loader {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  position: fixed;
  bottom: 0;
  left: 0;
  visibility: visible;
  opacity: 1;
  transition: all 0.5s;
}
.loader--front {
  z-index: 9999;
}
.loader--back {
  z-index: 1;
}
.loader--hidden {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  position: fixed;
  bottom: 0;
  left: 0;
  visibility: hidden;
  opacity: 0;
  transition: all 1s;
}
.loader-overlay {
  width: 100%;
  height: 100%;
  background-color: white;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 0
}
.loader-overlay--init {
  opacity: 1;
}
.loader-overlay--save {
  opacity: 0.8;
}
/* -- Init Loader -- */
.sk-cube-grid {
  width: 80px;
  height: 80px;
}
.sk-cube-grid--margin {
  margin-top: -128px;
}
.sk-cube-grid--no-margin {
  margin-top: 0;
}
.sk-cube-grid .sk-cube {
  width: 33%;
  height: 33%;
  background-color: #1a237e;
  float: left;
  -webkit-animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;
          animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;
}
.sk-cube-text {
  font-size: 18px;
  font-family: 'Roboto', sans-serif;
  font-weight: bold;
  color: #1a237e;
  position: relative;
  bottom: -10px;
  left: 0;
}
.sk-cube-grid .sk-cube1 {
  -webkit-animation-delay: 0.2s;
          animation-delay: 0.2s; }
.sk-cube-grid .sk-cube2 {
  -webkit-animation-delay: 0.3s;
          animation-delay: 0.3s; }
.sk-cube-grid .sk-cube3 {
  -webkit-animation-delay: 0.4s;
          animation-delay: 0.4s; }
.sk-cube-grid .sk-cube4 {
  -webkit-animation-delay: 0.1s;
          animation-delay: 0.1s; }
.sk-cube-grid .sk-cube5 {
  -webkit-animation-delay: 0.2s;
          animation-delay: 0.2s; }
.sk-cube-grid .sk-cube6 {
  -webkit-animation-delay: 0.3s;
          animation-delay: 0.3s; }
.sk-cube-grid .sk-cube7 {
  -webkit-animation-delay: 0s;
          animation-delay: 0s; }
.sk-cube-grid .sk-cube8 {
  -webkit-animation-delay: 0.1s;
          animation-delay: 0.1s; }
.sk-cube-grid .sk-cube9 {
  -webkit-animation-delay: 0.2s;
          animation-delay: 0.2s; }

@-webkit-keyframes sk-cubeGridScaleDelay {
  0%, 70%, 100% {
    -webkit-transform: scale3D(1, 1, 1);
            transform: scale3D(1, 1, 1);
  } 35% {
    -webkit-transform: scale3D(0, 0, 1);
            transform: scale3D(0, 0, 1);
  }
}

@keyframes sk-cubeGridScaleDelay {
  0%, 70%, 100% {
    -webkit-transform: scale3D(1, 1, 1);
            transform: scale3D(1, 1, 1);
  } 35% {
    -webkit-transform: scale3D(0, 0, 1);
            transform: scale3D(0, 0, 1);
  }
}
/* -- Save Loader -- */
.spinner {
  width: 80px;
  height: 80px;
  position: relative;
}
.spinner--margin {
  margin-top: -128px;
}
.spinner--no-margin {
  margin-top: 0;
}
.spinner-text {
  font-size: 18px;
  font-family: 'Roboto', sans-serif;
  font-weight: bold;
  color: #1a237e;
  position: absolute;
  bottom: -8px;
  left: 0;
}
.cube1, .cube2 {
  background-color: #1a237e;
  width: 15px;
  height: 15px;
  position: absolute;
  top: 0;
  left: 0;

  -webkit-animation: sk-cubemove 1.8s infinite ease-in-out;
  animation: sk-cubemove 1.8s infinite ease-in-out;
}
.cube2 {
  -webkit-animation-delay: -0.9s;
  animation-delay: -0.9s;
}
@-webkit-keyframes sk-cubemove {
  25% { -webkit-transform: translateX(42px) rotate(-90deg) scale(0.5) }
  50% { -webkit-transform: translateX(42px) translateY(42px) rotate(-180deg) }
  75% { -webkit-transform: translateX(0px) translateY(42px) rotate(-270deg) scale(0.5) }
  100% { -webkit-transform: rotate(-360deg) }
}
@keyframes sk-cubemove {
  25% {
    transform: translateX(42px) rotate(-90deg) scale(0.5);
    -webkit-transform: translateX(42px) rotate(-90deg) scale(0.5);
  } 50% {
    transform: translateX(42px) translateY(42px) rotate(-179deg);
    -webkit-transform: translateX(42px) translateY(42px) rotate(-179deg);
  } 50.1% {
    transform: translateX(42px) translateY(42px) rotate(-180deg);
    -webkit-transform: translateX(42px) translateY(42px) rotate(-180deg);
  } 75% {
    transform: translateX(0px) translateY(42px) rotate(-270deg) scale(0.5);
    -webkit-transform: translateX(0px) translateY(42px) rotate(-270deg) scale(0.5);
  } 100% {
    transform: rotate(-360deg);
    -webkit-transform: rotate(-360deg);
  }
}
</style>
