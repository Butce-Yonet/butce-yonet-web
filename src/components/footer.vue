<template>
  <div>
    <footer class="footer" :class="this.footer=='footer-dark'?'footer-dark':''">
      <div class="container-fluid">
        <div class="row">
          <div class="col-md-12 footer-copyright text-center">
            <p class="mb-0">Copyright {{ new Date().getFullYear() }} © by Ömer Faruk Şahin  </p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  export default {
    name: 'footerpage',
    computed:{
          ...mapGetters({
            footer: 'layout/footer'
          })
        }
  };
</script>
