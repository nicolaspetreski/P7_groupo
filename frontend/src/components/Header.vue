<template>
<div class="bg-header">
    <div class=" d-flex flex-column justify-content-around pt-4">
        <h1 class="main-title py-5"><span class='font-weight-bold text-uppercase title-size'>Grouppedit</span><br/>
        le premier principe d'une société libre est un flux de mots sans entraves dans un forum ouvert
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
    font-family: Georgia, 'Times New Roman', Times, serif ;
}
.logo-title{
    width: 12rem;
}
 .bg-header{
    background-image: url("../assets/gradient.jpg");
 }
 .bg-header-color{
     background-color: #f0e8c7;
 }
 .title-size{
     font-size: 2.1rem;
 }
</style>