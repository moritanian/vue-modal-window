<template>
  <div class="demo">
    <h2> vue-modal-window
      <a class="github-link" href="https://github.com/moritanian/vue-modal-window" target="github">github</a>
      <a class="npm-link" href="https://badge.fury.io/js/vue-modal-window" target="npm">npm</a>
    </h2>
    <div class="buttons">
      <div class="button"
        @click="visibleDemo1 = !visibleDemo1"
        :class="{active: visibleDemo1}"> resizable and draggable </div>
      <div class="button"
        @click="visibleDemo2 = !visibleDemo2"
        :class="{active: visibleDemo2}"> fixed</div>
      <div class="button"
        @click="visibleDemo3 = !visibleDemo3"
        :class="{active: visibleDemo3}"
        > iframe </div>

    </div>
    <vue-modal-window id=hogehoge :visible.sync="visibleDemo1" title="resizable and draggable">This is content</vue-modal-window>
    <vue-modal-window
      :visible.sync="visibleDemo2"
      title="fixed"
      class="dialog-modal"
      :draggable="false"
      :resizable="false"
      top=200
    >
      <div class="dialog-content">
        <div class="dialog-info">Fixed window</div>
        <div class="dialog-detail">
          <p>You can not drag and resize this window.</p>
          <p>You can only close this window.</p>
        </div>
        <div class="yes-no">
          <div class="modal-button yes-button" @click="visibleDemo2 = !visibleDemo2">yes</div>
          <div class="modal-button no-button" @click="visibleDemo2 = !visibleDemo2">no </div>
        </div>
      </div>
    </vue-modal-window>
    <vue-modal-window
      id=iframe-modal
      :visible.sync="visibleDemo3" title="iframe"
      contentUrl="./assets/original.pdf"
      width=400
      height=500
      :enableAnotherWindow="true"></vue-modal-window>
  </div>
</template>

<script>
import VueModalWindow from 'vue-modal-window';
export default {
  name: "Demo",
  components: {VueModalWindow},
  data() {
    return {
      visibleDemo1: false,
      visibleDemo2: false,
      visibleDemo3: false,
    };
  }
};
</script>

<style scoped lang="scss">
a {
  color: #656565;
  font-size: 14px;
  margin: 6px;
}
.buttons {
  margin-top: 40px;
  border-top: solid #e2e2e2 1px;
  padding-top: 10px;
  .button {
    float: left;
    margin: 4px;
    height: 30px;
    width: 160px;
    border-radius: 4px;
    border: solid 1px #7d7d7d;
    text-align: center;
    font-size: 13px;
    line-height: 30px;
    box-shadow: #d6d6d6e0 1px 1px 2px;
    cursor: pointer;

    &:hover {
      background-color: #e8e8e8;
    }

    &:active {
      background-color: #b3b3b3;
    }

    &.active {
      background-color: #b7b7b7;
      box-shadow: inset #000000 0px 1px 2px;
    }
  }
}

.dialog-modal {
  .dialog-content {
    padding: 6px;
    background-color: #e2e2e2;
    width: 100%;
    height: calc(100% - 12px);
    .dialog-info {
      font-size: 15px;
      margin: 3px 0px 7px;
    }
    .dialog-detail {
      font-size: 12px;
      p {
        margin: 0;
      }
    }
    .yes-no {
      margin-left: 60px;
      margin-top: 50px;
      .no-button {
        margin-left: 10px;
      }
    }
  }
}

.modal-button {
  height: 24px;
  width: 80px;
  border-radius: 4px;
  border: solid 1px #7d7d7d;
  text-align: center;
  font-size: 13px;
  line-height: 24px;
  box-shadow: #d6d6d6e0 1px 1px 2px;
  background: linear-gradient(#f1f1f1, #929292);
  float: left;
}
</style>

