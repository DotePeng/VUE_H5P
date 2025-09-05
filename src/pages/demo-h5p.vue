<template>
  <div class="demo">
    <H5PPlayer
      source-type="iframe"
      src="https://h5p.org/h5p/embed/1091122"
      @xapi="logXapi"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import H5PPlayer from '../components/H5PPlayer.vue';
import { initXapiService } from '../services/xapi';

function logXapi(e: any) {
  console.log('xAPI', e);
}

onMounted(() => {
  initXapiService({
    endpoint: '/api/xapi',
    tokenHeaderName: 'Authorization',
    tokenValue: 'Bearer demo',
    userId: 'demo-user',
    contentId: 'demo-content',
    sessionId: crypto.randomUUID()
  });
});
</script>

<style scoped>
.demo {
  width: 100%;
  height: 100%;
}
</style>
