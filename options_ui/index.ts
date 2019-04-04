import Vue from 'vue' 
import App from './App.vue'
import { ENGINES } from '../src/common';

new Vue({
    el: "#app",
    render: h => h(App)
})