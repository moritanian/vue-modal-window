import Vue from 'vue';
import Demo from './demo.vue';

const app = new Vue({
  render: h => h(Demo),
}).$mount('#app')
