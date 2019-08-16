<template>
    <div class="fund-select">
        <el-select v-model="val" style="width:100%"  size="small" placeholder="请选择指数">
            <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
            </el-option>
        </el-select>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'

@Component
export default class FundSelect extends Vue {
    @Prop() private value!:string

    private val:string = this.value
    private options = [
      { value: '1.000905', label: '中证500' },
      { value: '1.000300', label: '沪深300' },
      { value: '0.399006', label: '创业板' },
      { value: '1.000016', label: '上证50' }
    ]
    @Watch('value')
    valueOutChange (nval:string) {
      this.val = nval
    }
    @Watch('val')
    valChange (nval:string) {
      this.$emit('input', nval)
    }
}
</script>
