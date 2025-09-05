<template>
  <div ref="wrapper" :style="wrapperStyle">
    <iframe
      v-if="visible"
      ref="frame"
      :src="src"
      :allowfullscreen="allowFullscreen"
      sandbox="allow-scripts allow-same-origin"
      referrerpolicy="no-referrer"
      @load="onLoaded"
    ></iframe>
    <div v-else class="placeholder">載入中...</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';

const props = defineProps<{
  src: string;
  width?: number;
  height?: number;
  allowFullscreen?: boolean;
}>();

const emit = defineEmits<{ (e: 'loaded'): void; (e: 'resized', h: number): void; (e: 'error', err: any): void }>();

const frame = ref<HTMLIFrameElement | null>(null);
const wrapper = ref<HTMLElement | null>(null);
const visible = ref(false);
let observer: IntersectionObserver | null = null;

const wrapperStyle = computed(() => ({
  width: props.width ? `${props.width}px` : '100%',
  height: props.height ? `${props.height}px` : '100%'
}));

function onLoaded() {
  emit('loaded');
}

function handleMessage(ev: MessageEvent) {
  if (ev.origin !== new URL(props.src).origin) return;
  const data = ev.data as any;
  if (data?.context === 'h5p' && data.type === 'resize') {
    const height = Number(data.height);
    if (frame.value) frame.value.style.height = height + 'px';
    emit('resized', height);
  }
}

function initObserver() {
  if (!wrapper.value) return;
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      visible.value = true;
      observer?.disconnect();
    }
  });
  observer.observe(wrapper.value);
}

onMounted(() => {
  initObserver();
  window.addEventListener('message', handleMessage);
});

onBeforeUnmount(() => {
  window.removeEventListener('message', handleMessage);
  observer?.disconnect();
});
</script>

<style scoped>
.placeholder {
  text-align: center;
  padding: 1rem;
}
iframe {
  width: 100%;
  border: none;
}
</style>
