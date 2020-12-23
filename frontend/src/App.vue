<template>
    <div id="app">
      <!--NAVBAR - SEE COMPONENT 'Header.vue'-->
      <Header></Header>

      <!--ROUTER - SEE 'router/index.js'-->
      <router-view></router-view>

      <!--FOOTERBAR - SEE COMPONENT 'Footer.vue'-->
      <Footer></Footer>
    </div>
</template>

<script>
import Header from './components/Header'
import Footer from './components/Footer'
export default {
  name: 'App',
  components: {Header, Footer}
}
</script>

<style>
@font-face {
  font-family: 'Chewy';
  src: url("./assets/fonts/Chewy.woff") format('woff');
}
a, button, i{
  outline: 0 none !important;
}
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Chewy';
  text-align: center;
  margin: 0;
  padding: 0;
}
</style>
