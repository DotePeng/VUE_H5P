<template>
  <component
    :is="componentName"
    v-bind="componentProps"
    @xapi="forwardXapi"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import H5PStandalonePlayer from './H5PStandalonePlayer.vue';
import H5PIframePlayer from './H5PIframePlayer.vue';

const props = defineProps<{
  sourceType: 'local' | 'iframe';
  src: string;
  width?: number;
  height?: number;
  locale?: string;
  frameCssUrls?: string[];
  disableFullscreen?: boolean;
}>();

const emit = defineEmits<{ (e: 'xapi', ev: any): void }>();

const componentName = computed(() =>
  props.sourceType === 'local' ? H5PStandalonePlayer : H5PIframePlayer
);

const componentProps = computed(() => ({
  contentUrl: props.sourceType === 'local' ? props.src : undefined,
  src: props.sourceType === 'iframe' ? props.src : undefined,
  width: props.width,
  height: props.height,
  frameCssUrls: props.frameCssUrls,
  allowFullscreen: !props.disableFullscreen
}));

function forwardXapi(ev: any) {
  emit('xapi', ev);
}
</script>
