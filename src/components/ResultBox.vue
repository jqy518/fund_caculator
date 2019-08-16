<template>
    <el-card class="box-card">
        <div slot="header" class="clearfix">
            <span>结果</span>
        </div>
        <el-form>
            <el-form-item label="投入本金："><span style="font-size:20px;">{{result.base}}</span></el-form-item>
            <el-form-item label="收益："><span style="color:blue;">{{result.earnings}}</span></el-form-item>
            <el-form-item label="平均年化："><span style="font-size:30px; color:red;">{{result.ratio}}</span></el-form-item>
        </el-form>

    </el-card>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
export interface ResultObj {
    base:number,
    earnings:string,
    ratio:string
}
@Component
export default class ResultBox extends Vue {
    @Prop() private result!:ResultObj
}
</script>
