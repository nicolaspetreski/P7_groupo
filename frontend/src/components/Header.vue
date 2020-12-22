<template>
<div class="bg-header">
    <div class=" d-flex flex-column justify-content-around pt-4">
        <h1 class="main-title py-5"><span class='font-weight-bold text-uppercase title-size'>Grouppedit</span><br/>
        <p>"Le premier principe d'une société libre est un flux de mots sans entraves dans un forum ouvert"</p>
             </h1>
        <div>
            <img class="logo-title" src='../assets/logo_white.png' alt="Icone de Groupomania">
        </div>
   </div>
</div>
</template>

<script>

export default {
  name: 'Header',
}
</script>


<style scoped lang="scss">
.main-title{
    font-size: 1.5rem;
    color: #fff;
    font-family: 'Staatliches', cursive;
        p{
            font-size: 1rem;
            font-style: italic;
        }
}
.logo-title{
    width: 12rem;
}
 .bg-header{
    background: #000000;
    background: -webkit-linear-gradient(to right, #434343, #000000);
    background: linear-gradient(to right, #434343, #000000);


 }
 .bg-header-color{
     background-color: #f0e8c7;
 }
 .title-size{
     font-size: 2.1rem;
 }
</style>