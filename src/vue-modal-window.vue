<template>
  <div class="vue-modal-window" v-show="visibleMain">
    <div class="main" :class="{active: active}" :style="modalStyle" @click="onClickModal">
      <div class="title" :title="title" @dblclick="maximize" @mousedown="onDraggableDown">
        <div class="title-text">{{title}}</div>
        <div class="head-buttons">
          <div class="head-button minimize-button" @click.stop.prevent="onClickMinimizeButton">
            <div></div>
          </div>
          <div class="head-button maximize-button" @click.stop.prevent="onClickMaximizeButton">
            <div></div>
          </div>
        </div>
      </div>
      <div class="modal-content" ref="content">
        <slot></slot>
        <iframe v-if="contentUrl" :src="contentUrl" ref="iframe"></iframe>
      </div>
      <div
        class="resizable"
        :class="name"
        :key="name"
        @mousedown="onResizableDown(name)"
        v-for="name in [
          'top-left', 'top-right', 'bottom-left', 'bottom-right',
          'top', 'left', 'right', 'bottom'
        ]"
      ></div>
    </div>
    <div class="cover" :class="activeResizableName" v-show="dragging || activeResizableName"></div>
  </div>
</template>

<script>
import uuid from "uuid/v4";
import Vue from "vue";

let instanceOrderedList = [];
const baseZIndex = 1000;
const localStorageKey = "vue-modal-window";

export default {
  name: "VueModalWindow",
  props: {
    id: {
      type: String,
      default: uuid()
    },
    contentUrl: {
      type: String
    },
    visible: {
      type: Boolean,
      default: true
    },
    enableAnotherWindow: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: "vue-modal-window"
    },
    width: {
      type: Number,
      default: 300
    },
    height: {
      type: Number,
      default: 200
    },
    minWidth: {
      type: Number,
      default: 60
    },
    minHeight: {
      type: Number,
      default: 20
    },
    resizable: {
      type: Boolean,
      default: true
    },
    draggable: {
      type: Boolean,
      default: true
    },
    recordRect: {
      type: Boolean,
      default: true
    },
    recordVisibility: {
      type: Boolean,
      default: true
    }
  },
  data() {
    let boundingClientRect = {
      left: 0,
      top: 0,
      right: this.width,
      bottom: this.height
    };

    if (this.recordRect || this.recordVisibility) {
      let vmodalDataDict = JSON.parse(localStorage.getItem(localStorageKey));
      if (vmodalDataDict && vmodalDataDict[this.id]) {
        let vmodalData = vmodalDataDict[this.id];
        if (this.recordRect && vmodalData.rect) {
          boundingClientRect = vmodalData.rect;
        }
        if (this.recordVisibility && vmodalData.hasOwnProperty("visible")) {
          this.$emit("update:visible", vmodalData.visible);
        }
      }
    }

    return {
      boundingClientRect,
      dragging: false,
      draggingDownEvent: null,
      activeResizableName: null,
      instanceOrderedList: instanceOrderedList,
      anotherWindow: null,
      maximized: false
    };
  },
  computed: {
    rectWidth() {
      return this.boundingClientRect.right - this.boundingClientRect.left;
    },
    rectHeight() {
      return this.boundingClientRect.bottom - this.boundingClientRect.top;
    },
    modalStyle() {
      if (this.maximized) {
        return {
          width: document.body.clientWidth + "px",
          height: document.body.clientHeight + "px",
          top: "0px",
          left: "0px",
          zIndex: this.zIndex
        };
      }
      this.validateBoundingClientRect(this.boundingClientRect);
      return {
        width: this.rectWidth + "px",
        height: this.rectHeight + "px",
        top: this.boundingClientRect.top + "px",
        left: this.boundingClientRect.left + "px",
        zIndex: this.zIndex
      };
    },
    zIndex() {
      return baseZIndex + this.instanceOrderedList.indexOf(this);
    },
    active() {
      return (
        this.instanceOrderedList[this.instanceOrderedList.length - 1] === this
      );
    },
    visibleMain() {
      return this.visible && !this.anotherWindow;
    }
  },
  mounted() {
    this.instanceOrderedList.push(this);
    document.body.addEventListener("mousemove", this.onMouseMove, false);
    document.body.addEventListener("mouseup", this.onMouseUp, false);
    document.body.addEventListener("mouseleave", this.onMouseLeave, false);
  },
  beforeDestroy() {
    this.deleleFromInstanceOrderedList();
    document.body.removeEventListener("mousemove", this.onMouseMove, false);
    document.body.removeEventListener("mouseup", this.onMouseUp, false);
    document.body.removeEventListener("mouseleave", this.onMouseLeave, false);
  },
  methods: {
    onMouseMove(event) {
      if (this.draggingDownEvent) {
        this.dragging = true;
      }
      if (this.dragging) {
        event.preventDefault();
        this.onDraggableMove(event);
      }
      if (this.activeResizableName) {
        event.preventDefault();
        this.resize(this.activeResizableName, event.clientX, event.clientY);
      }
    },
    onMouseUp(event) {
      if ((this.dragging || this.activeResizableName) && this.recordRect) {
        let vmodalDataDict =
          JSON.parse(localStorage.getItem(localStorageKey)) || {};
        if (!vmodalDataDict[this.id]) {
          vmodalDataDict[this.id] = {};
        }
        vmodalDataDict[this.id].rect = Object.assign(
          {},
          this.boundingClientRect
        );
        localStorage.setItem(localStorageKey, JSON.stringify(vmodalDataDict));
      }
      this.activeResizableName = null;
      this.dragging = false;
      this.draggingDownEvent = null;
      return true;
    },
    onClickModal(event) {
      this.setForeground();
    },
    onClickMaximizeButton(event) {
      if (this.enableAnotherWindow) {
        this.openWindow();
      } else {
        this.maximize();
      }
    },
    onClickMinimizeButton(event) {
      this.$emit("update:visible", !this.visible);
    },
    onDraggableDown(event) {
      if (
        !event.target.classList.contains("title") &&
        !event.target.classList.contains("title-text")
      ) {
        return;
      }
      this.setForeground();
      if (!this.draggable) {
        return;
      }

      this.draggingDownEvent = {
        offsetX: event.offsetX,
        offsetY: event.offsetY
      };
    },
    onMouseLeave(event) {
      this.dragging = false;
      this.draggingDownEvent = null;
      this.activeResizableName = null;
      return false;
    },
    onDraggableMove(event) {
      let width = this.rectWidth;
      let height = this.rectHeight;
      this.boundingClientRect.left =
        event.clientX - this.draggingDownEvent.offsetX;
      this.boundingClientRect.top =
        event.clientY - this.draggingDownEvent.offsetY;
      this.boundingClientRect.right = this.boundingClientRect.left + width;
      this.boundingClientRect.bottom = this.boundingClientRect.top + height;
    },
    onResizableDown(name) {
      if (!this.resizable) {
        return;
      }
      this.activeResizableName = name;
    },
    resize(resizableName, x, y) {
      this.$refs.content.children[0].dispatchEvent(new Event("resize"));
      let operations = resizableName.split("-");
      if (operations.indexOf("left") !== -1) {
        this.boundingClientRect.left = Math.min(
          x,
          this.boundingClientRect.right - this.minWidth
        );
      }
      if (operations.indexOf("right") !== -1) {
        this.boundingClientRect.right = Math.max(
          x,
          this.boundingClientRect.left + this.minWidth
        );
      }
      if (operations.indexOf("top") !== -1) {
        this.boundingClientRect.top = Math.min(
          y,
          this.boundingClientRect.bottom - this.minHeight
        );
      }
      if (operations.indexOf("bottom") !== -1) {
        this.boundingClientRect.bottom = Math.max(
          y,
          this.boundingClientRect.top + this.minHeight
        );
      }
    },
    validateBoundingClientRect(rect) {
      let width = this.rectWidth;
      let height = this.rectHeight;
      rect.top = Math.min(
        Math.max(rect.top, 0),
        document.body.clientHeight - this.minHeight
      );
      rect.left = Math.min(
        Math.max(rect.left, this.minWidth - width),
        document.body.clientWidth - this.minWidth
      );
      rect.right = rect.left + width;
      rect.bottom = rect.top + height;
    },
    deleleFromInstanceOrderedList() {
      const index = this.instanceOrderedList.indexOf(this);
      if (index === -1) {
        throw new Error("This instance has not exist in instanceOrderList");
      }
      return this.instanceOrderedList.splice(index, 1);
    },
    setForeground() {
      this.deleleFromInstanceOrderedList();
      this.instanceOrderedList.push(this);
    },
    openWindow() {
      if (this.contentUrl) {
        this.anotherWindow = window.open(
          this.contentUrl,
          "window",
          "width=500,height=500"
        );
      } else {
        console.log(this.$refs.content.innerHTML);
        let html = this.$refs.content.innerHTML;
        /*
        this.anotherWindow = window.open(
          "data:text/html;charset=utf-8," + html,
          "window",
          "width=500,height=500"
        );
        */
        let encoded = html; //encodeURIComponent(html);
        let a = document.createElement(`a`);
        a.target = `_blank`;
        a.href = `data:text/html;charset=utf-8,${encoded}`;
        a.style.display = `none`;
        document.body.appendChild(a); // We need to do this,
        a.click(); // so that we can do this,
        //document.body.removeChild(a);
        return;
      }

      this.anotherWindow.addEventListener("load", () => {
        this.anotherWindow.addEventListener("unload", () => {
          this.anotherWindow = null;
        });
      });
    },
    reload() {
      if (this.contentUrl) {
        this.$refs.iframe.contentDocument.location.reload(true);
      }
    },
    maximize() {
      this.maximized = !this.maximized;
    }
  },
  watch: {
    visible(value) {
      if (value) {
        this.setForeground();
      } else {
        if (this.anotherWindow) {
          this.anotherWindow.close();
          this.anotherWindow = null;
        }
      }
      if (this.recordVisibility) {
        let vmodalDataDict = JSON.parse(localStorage.getItem(localStorageKey));
        if (vmodalDataDict && vmodalDataDict[this.id]) {
          let vmodalData = vmodalDataDict[this.id];
          vmodalData.visible = value;
          localStorage.setItem(localStorageKey, JSON.stringify(vmodalDataDict));
        }
      }
    }
  }
};
</script>

<style scoped lang="scss">
.main {
  position: absolute;
  background: rgb(251, 253, 255);
  border-radius: 4px;
  border: solid #d0d0d0 1px;
  cursor: default;
  box-shadow: #0000002b 0px 0px 3px;

  &.active {
    box-shadow: rgba(0, 0, 0, 0.29) 0px 0px 13px;
  }

  &.active .title {
    background: linear-gradient(to bottom, #696969, #4a4a4a);
  }

  .title {
    height: 22px;
    font-size: 13px;
    background: linear-gradient(to bottom, #585858, #383838);
    border-radius: 4px 4px 0 0;

    .title-text {
      color: white;
      padding-left: 4px;
      padding-top: 2px;
    }
    .head-buttons {
      position: absolute;
      top: 2px;
      right: 12px;
      .head-button {
        border-radius: 9px;
        width: 15px;
        height: 15px;
        background-color: #ababab;
        border: solid #3e3e3eb5 1px;
        display: inline-block;
        &:hover {
          background-color: #c3c3c3;
        }
        &:active {
          background-color: #f5f5f5;
        }
      }
      .minimize-button {
        div {
          width: 9px;
          height: 1px;
          background-color: #4c4c4c;
          left: 3px;
          position: relative;
          top: 7px;
        }
      }
      .maximize-button {
        div {
          width: 7px;
          height: 7px;
          border: solid 1px #4c4c4c;
          left: 3px;
          position: relative;
          top: 3px;
        }
      }
    }
  }
  .modal-content {
    width: 100%;
    height: calc(100% - 22px);
    overflow: auto;
    position: relative;
    border-radius: 0 0 4px 4px;

    iframe {
      width: 100%;
      height: calc(100% - 3px);
      border: none;
    }
  }

  .resizable {
    position: absolute;

    &.right,
    &.left {
      width: 3px;
      height: calc(100% - 12px);
      top: 8px;
      cursor: ew-resize;
    }
    &.top,
    &.bottom {
      height: 3px;
      width: calc(100% - 12px);
      left: 8px;
      cursor: ns-resize;
    }
    &.top-left,
    &.top-right,
    &.bottom-left,
    &.bottom-right {
      width: 8px;
      height: 8px;
    }
    &.right,
    &.top-right,
    &.bottom-right {
      right: 0px;
    }
    &.left,
    &.top-left,
    &.bottom-left {
      left: 0px;
    }
    &.top,
    &.top-left,
    &.top-right {
      top: 0px;
    }
    &.bottom,
    &.bottom-left,
    &.bottom-right {
      bottom: 0px;
    }
  }
}
.cover {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5000;
}

.right,
.left {
  cursor: ew-resize;
}
.top,
.bottom {
  cursor: ns-resize;
}
.top-left {
  cursor: nw-resize;
}
.top-right {
  cursor: ne-resize;
}
.bottom-left {
  cursor: sw-resize;
}
.bottom-right {
  cursor: se-resize;
}
</style>

