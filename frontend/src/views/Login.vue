<template>
<div class="d-flex flex-column align-items-center">
    <h2 class="text-center subtitle pt-5 pb-4">Connexion</h2>
    <p class="text-center font-italic">Connectez-vous afin d'accéder au forum !</p>
    <LoginForm/>
</div>
</template>

<script>
import LoginForm from '../components/LoginForm'

export default {
  name: 'Login',
  components: {
  LoginForm
    }
}
</script>


<style scoped lang="scss">
.subtitle{
    font-size: 2rem;
    color:white;
    font-family: 'Staatliches', cursive;
}
</style>

