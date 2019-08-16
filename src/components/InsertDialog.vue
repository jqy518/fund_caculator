<template>
<el-dialog title="设置" :visible.sync="dialogFormVisible" width="360px">
  <el-form :model="form" label-width="100px">
    <el-form-item label="插入方式" >
      <el-radio-group size="small" v-model="form.type">
      <el-radio-button label="1">开始时间</el-radio-button>
      <el-radio-button label="2">结束时间</el-radio-button>
      <el-radio-button label="3" :disabled="!isbetween">补仓</el-radio-button>
    </el-radio-group>
    </el-form-item>
    <el-form-item label="补仓金额">
      <el-input size="small" :disabled="form.type!=3 || !isbetween" v-model.number="form.money">
        <template slot="append">元</template>
      </el-input>
    </el-form-item>
  </el-form>
  <div slot="footer" class="dialog-footer">
    <el-button @click="dialogFormVisible = false">取 消</el-button>
    <el-button type="primary" @click="submitData">确 定</el-button>
  </div>
</el-dialog>
</template>
<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
export interface InsertForm {
  type:string,
  money:number
}
@Component
export default class InsertDialog extends Vue {
  @Prop() private visible!:boolean
  @Prop() private isbetween!:boolean
  private dialogFormVisible:boolean = this.visible
  private form:InsertForm = {
    type: '1',
    money: 0
  }
  submitData () {
    this.$emit('submit', Object.assign({}, this.form))
    this.dialogFormVisible = false
  }
  @Watch('visible')
  visibleWatch (nval:boolean) {
    this.dialogFormVisible = nval
  }
  @Watch('dialogFormVisible')
  ivisibleWatch (nval:boolean) {
    this.$emit('change', nval)
  }
}
</script>
