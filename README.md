vue-modal-window
========

[![npm version](https://badge.fury.io/js/vue-modal-window.svg)](https://badge.fury.io/js/vue-modal-window)

#### OS like modal window component for vuejs ####

<a href="https://moritanian.github.io/vue-modal-window/demo/dist/"><img src="https://moritanian.github.io/vue-modal-window/static/demo.gif"/></a>


<p align="center"><a href="https://moritanian.github.io/vue-modal-window/demo/dist/">DEMO</a></p>

## Props

| Prop    | Type | Default | Usage  |
| ------  | ---- | --- | ------ |
| id   | String | uuid | id attribute of the dom element which is used for identify the modal window.|
| contentUrl | String | '' | Url of iframe of the content. When this property is set, iframe is rendered as the content of the window. |
| visible | Number | 200 | Set true to show the modal window. |
| enableAnotherWindow | Boolean | false | Set true to show real child window (window.open) when maximize button is clicked.  This property is enabled when contentUrl property is set. |
| title | String | '' | Title text of the modal window. |
| width | String | 300 | Initial width of the modal window. |
| height | String | 300 | Initial height of the modal window. |
| top | String | 300 | Initial top of the modal window. |
| left | String | 300 | Initial left of the modal window. |
| minWidth | String | 60 | Minimum width of the modal window. |
| minHeight | String | 20 | Minimum height of the modal window. |
| resizable | Boolean | true | Set true to enable resizing. |
| draggable | Boolean | true | Set true to enable dragging. |
| recordRect | Boolean | true | Set true to record the rect of the window and load it. |
| recordVisibility | Boolean | true | Set true to record the visibility of the window and load it. |


## Usage
```demo.vue
<template>
  <vue-modal-window :visible.sync="visibleDemo1">This is content</vue-modal-window>
</template>
<script>
import VueModalWindow  from 'vue-modal-window';
export default {
  components: {VueModalWindow}
};
</script>
```
