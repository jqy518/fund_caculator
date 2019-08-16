<template>
    <el-card class="box-card">
    <div slot="header" class="clearfix">
        <span>定投计算器</span>
    </div>
    <fund-select v-model="fund"></fund-select>
    <el-form inline-message>
        <el-form-item>
            <el-date-picker
            size="small"
            v-model="formData.startDate"
            value-format="yyyy-MM-dd"
            type="date"
            placeholder="开始日期">
            </el-date-picker>
        </el-form-item>
        <el-form-item>
            <el-date-picker
            size="small"

            value-format="yyyy-MM-dd"
            v-model="formData.endDate"
            type="date"
            placeholder="结束日期">
            </el-date-picker>
        </el-form-item>
        <el-form-item>
            <el-select v-model="formData.method" style="width:100%" size="small" placeholder="方式">
                <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
                </el-option>
            </el-select>
        </el-form-item>
        <el-form-item>
            <el-input v-model.number="formData.money"  size="small" placeholder="金额"></el-input>
        </el-form-item>
        <el-form-item>
            <el-input v-model="formData.rate"  size="small" placeholder="费率">
                <template slot="append">%</template>
            </el-input>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" style="width:100%" size="small" @click="doCaculate">计算</el-button>
        </el-form-item>
    </el-form>
    </el-card>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import FundSelect from './FundSelect.vue'

export interface formTypes {
    startDate:string,
    endDate:string,
    method: string,
    rate: string,
    money:number
}
@Component({
  components: {
    FundSelect
  }
})
export default class FormBar extends Vue {
    @Prop() private initPrams!:formTypes
    @Prop() private fundVal!:string

    private fund:string = this.fundVal
    private formData:formTypes = {
      startDate: '2019-03-01',
      endDate: '2019-05-01',
      method: 'week',
      rate: '1.2',
      money: 10000
    }
    private options = [
      { value: 'week', label: '每周' },
      { value: 'month', label: '每月' }
    ]

    doCaculate () {
      this.$emit('caculate', this.formData)
    }
    @Watch('fund')
    fundChange (nval:string) {
      this.$emit('fundChange', nval)
    }
}
</script>
