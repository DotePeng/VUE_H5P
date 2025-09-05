<template>
  <!-- H5P 容器 -->
  <div ref="container" :style="containerStyle"></div>
  <div v-if="error" class="h5p-error">
    <p>{{ error }}</p>
    <button @click="retry">重新載入</button>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import type { H5PStandalone } from '../types/h5p';

/**
 * props 定義
 * contentUrl: 已解包內容的根目錄
 * frameCssUrls: 額外注入的 CSS
 */
const props = defineProps<{
  contentUrl: string;
  frameCssUrls?: string[];
  width?: number;
  height?: number;
}>();

const emit = defineEmits<{ (e: 'loaded'): void; (e: 'xapi', ev: any): void }>();

const container = ref<HTMLDivElement | null>(null);
const error = ref<string>('');
let player: H5PStandalone | null = null;
let resizeObs: ResizeObserver | null = null;

const containerStyle = computed(() => ({
  width: props.width ? `${props.width}px` : '100%',
  height: props.height ? `${props.height}px` : '100%'
}));

async function init() {
  try {
    // 動態載入 h5p-standalone
    const { H5PStandalone } = await import('h5p-standalone');
    player = new H5PStandalone(container.value!, {
      contentUrl: props.contentUrl,
      frameCss: props.frameCssUrls
    });
    emit('loaded');
    bindXapi();
    observe();
  } catch (e: any) {
    error.value = e?.message ?? '載入失敗';
  }
}

function bindXapi() {
  const dispatcher = (window as any).H5P?.externalDispatcher;
  if (dispatcher) {
    dispatcher.on('xAPI', (event: any) => emit('xapi', event));
  }
}

function observe() {
  if (!container.value) return;
  resizeObs = new ResizeObserver(() => {
    player?.resize?.();
  });
  resizeObs.observe(container.value);
}

function retry() {
  error.value = '';
  init();
}

onMounted(init);

onBeforeUnmount(() => {
  resizeObs?.disconnect();
  player?.destroy?.();
});

// 暴露方法供父層呼叫
function play() {
  // h5p-standalone 無明確 play API，保留擴充
}

function destroy() {
  player?.destroy?.();
}

// defineExpose 讓父層可呼叫
defineExpose({ play, destroy });
</script>

<style scoped>
.h5p-error {
  color: #c00;
}
</style>
