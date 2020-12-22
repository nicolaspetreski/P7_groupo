<template>
<div class="d-flex flex-column align-items-center">
    <h2 class="text-center subtitle pt-5 pb-4">Inscription</h2>
    <p class="text-center font-italic">Inscription rapide en trois étape!</p>
    <SignupForm/>
</div>
</template>

<script>
import SignupForm from '../components/SignupForm'

export default {
    name: 'Signup',
    components: {
    SignupForm   
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
