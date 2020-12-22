<template>
<div id="app">

  <header>
    <div id="nav" class="bg-nav py-2">
      <!-- User not connected -->
      <div class="" v-if =" id === null " >
        <router-link to="/signup">Je m'inscris</router-link>
        <router-link to="/login">Connexion</router-link> 
      </div> 
    </div> 
    <Header/>
  </header>

  <body class="bg-body">
    <router-view/>
  </body>

  <footer>
    <Footer/>
  </footer>

</div>
</template>

<script>
import Header from './components/Header'
import Footer from './components/Footer'

export default {
  name: 'App',
  components: {
    Header,
    Footer
  },
  data(){
    return {
      id: ''
    }
  },
  mounted() {
    let idUser = localStorage.getItem('Id');
    console.log(idUser);
    this.id = idUser;
  },
  methods: {
    exitUser (){
       localStorage.removeItem('Id');
       localStorage.removeItem('token');
       localStorage.removeItem('isAdmin');
       localStorage.removeItem('email');
       location.replace(location.origin + "/signup#/signup");
       location.reload();
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Staatliches', cursive;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

#nav{
background: #000000;
background: -webkit-linear-gradient(to right, #434343, #000000);
background: linear-gradient(to right, #434343, #000000);
display: flex;
flex-direction: row;
justify-content: flex-end;
  a {
    font-family: 'Staatliches', cursive;
    font-size: 1.2rem;
    color:white;
    padding: 3rem; 
  }
}

.bg-body{
font-family: 'Staatliches', cursive;
background: #000000;  /* fallback for old browsers */
background: -webkit-linear-gradient(to right, #434343, #000000);
background: linear-gradient(to right, #434343, #000000);
border-width: 2;
border-top-left-radius: 10rem;
border-color: white;
border-style: solid;
color: white;
}
</style>
