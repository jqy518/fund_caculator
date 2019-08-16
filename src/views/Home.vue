<template>
  <div class="main-box">
    <div class="chart-box">
      <line-chart :data-obj ="fundData" :dates="dateFlag"   @insert = "insertShow"></line-chart>
      <insert-dialog :visible="dvisible" :isbetween = "between" @change="dialogChange" @submit="insertValue"></insert-dialog>
    </div>
    <div class="center-bar">
      <form-bar
       @caculate = "caculateFun"
       @fundChange = "fundChange"
       :fund-val="fundVal"
       :init-params = "caculateParams"></form-bar>
    </div>
    <div class="center-bottom">
      <result-box :result = "resutObj"></result-box>
    </div>
    <div class="floor-box">
      <div class="year-item">
        <year-chart :dataObj="years" :max="maxValue" :size="yearSize"></year-chart>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import LineChart, { ChartData, DateScope } from '@/components/LineChart.vue' // @ is an alias to /src
import InsertDialog, { InsertForm } from '@/components/InsertDialog.vue'
import YearChart, { YearChartData } from '@/components/YearChart.vue' // @ is an alias to /src
import FormBar, { formTypes } from '@/components/FormBar.vue'
import ResultBox, { ResultObj } from '@/components/ResultBox.vue'
import { getIndexFund } from '@/api.ts'
import moment from 'moment'

interface DayDataType {
   date: string,
   money: number,
    copies: number
}

@Component({
  components: {
    LineChart,
    FormBar,
    YearChart,
    ResultBox,
    InsertDialog
  }
})
export default class Home extends Vue {
  private fundData:ChartData = {
    name: '',
    categoryData: [],
    values: []
  }
  private dateFlag:DateScope = {
    startDate: null,
    endDate: null
  }
  private dvisible:boolean = false
  private between:boolean = false
  private fundVal:string = '1.000905'
  private referencePoint:string = ''
  private days:DayDataType[] = []
  private years:YearChartData[] = []
  private yearSize:number = 0
  private maxValue:number = 0;
  private closeValue:number = 0;
  private toBeInsert:any = {}
  private resutObj:ResultObj = {
    base: 0,
    earnings: '0',
    ratio: '0%'
  }
  private caculateParams:formTypes = {
    startDate: '',
    endDate: '',
    method: 'week',
    rate: '1.2',
    money: 10000
  }
  private fundName:string = ''
  created () {
    this.getData()
  }
  async getData () {
    let data = await getIndexFund(this.fundVal)
    this.dateFlag.endDate = null
    this.dateFlag.startDate = null
    this.adapteData(data)
  }
  adapteData (data:any) {
    this.fundName = data.data.name
    let temdata = data.data.klines
    this.fundData.name = this.fundName
    this.fundData.categoryData = []
    this.fundData.values = []
    temdata.forEach((element:string) => {
      let self = this
      let sdata:string[] = element.split(',')
      this.fundData.categoryData.push(sdata.shift() as string)
      this.fundData.values.push(sdata.map((item) => {
        return Number(item)
      }))
    }, this)
  }
  fundChange (val:string) {
    this.fundVal = val
    this.getData()
  }
  caculateFun (params:formTypes):void {
    this.caculateParams = params
    this.days = this.generateDays(params.startDate, params.endDate)
    this.generateYears()
    this.caculateResult()
  }
  dialogChange (val:boolean) {
    this.dvisible = val
  }
  insertShow (res:any) {
    this.toBeInsert = res
    let date = this.toBeInsert.date
    this.between = moment(date).isBetween(this.caculateParams.startDate, this.caculateParams.endDate)

    this.dvisible = true
  }
  insertValue (form:InsertForm) {
    switch (form.type) {
      case '1' :
        this.setStartDate()
        break
      case '2' :
        this.setEndDate()
        break
      case '3' :
        let dayObj = this.insertToDayObj(form.money)
        this.days.push(dayObj)
        this.generateYears()
        this.caculateResult()
        break
    }
  }
  setStartDate () {
    let start = this.toBeInsert.date
    let startNow = this.caculateParams.startDate
    let endNow = this.caculateParams.endDate
    if (!startNow) {
      this.caculateParams.startDate = start
    } else if (startNow < start && start < endNow) {
      this.days = this.days.filter((item) => {
        return moment(start).isBefore(item.date)
      })
      this.generateYears()
      this.caculateResult()
      this.caculateParams.startDate = start
    } else if (startNow > start) {
      let appendDays = this.generateDays(start, startNow)
      this.days = this.days.concat(appendDays)
      this.generateYears()
      this.caculateResult()
      this.caculateParams.startDate = start
    } else if (start > endNow) {
      this.$message({
        type: 'warning',
        message: '开始时间必须在结束时间之前',
        showClose: true
      })
    }
  }
  setEndDate () {
    let waitSetDate = this.toBeInsert.date
    let currEnddate = this.caculateParams.endDate
    if (!currEnddate) {
      this.caculateParams.endDate = waitSetDate
    } else if (moment(waitSetDate).isBefore(currEnddate)) {
      this.$message({
        type: 'warning',
        message: '结束时间必须在原结束时间之后',
        showClose: true
      })
    } else {
      let start = moment(this.caculateParams.endDate).add(1, 'd').format('YYYY-MM-DD')
      let appendDays = this.generateDays(start, waitSetDate)
      this.days = this.days.concat(appendDays)
      this.generateYears()
      this.caculateResult()
      this.caculateParams.endDate = waitSetDate
    }
  }
  caculateResult () {
    let base = 0
    let result = 0
    this.days.forEach(item => {
      base = base + item.money
      result = result + item.copies
    })
    this.resutObj.base = base
    let earnings = result * this.closeValue - base
    this.resutObj.ratio = (earnings / base * 100).toFixed(2) + '%'
    this.resutObj.earnings = earnings.toFixed(2)
  }
  generateDays (startDate:string, endDate:string) {
    let daysArr:DayDataType[] = []
    let { method, rate, money } = this.caculateParams
    this.fundData.categoryData.forEach((item, index) => {
      if (item >= startDate && item <= endDate) {
        if (!this.referencePoint) {
          this.referencePoint = item
        }
        this.closeValue = this.fundData.values[index][1]
        switch (method) {
          case 'week' :
            if (moment(this.referencePoint).day() === moment(item).day()) {
              daysArr.push(this.getDayObj(item, index, money, rate))
            }
            break
          case 'month' :
            if (moment(this.referencePoint).date() === moment(item).date()) {
              daysArr.push(this.getDayObj(item, index, money, rate))
            }
            break
        }
      }
    }, this)
    return daysArr
  }
  generateYears () {
    let years:YearChartData[] = []
    this.days = this.days.sort((a, b) => {
      return a.date > b.date ? 1 : (a.date === b.date ? 0 : -1)
    })
    let cyear:string = ''
    let index = -1
    this.days.forEach((item) => {
      let year = moment(item.date).year() + ''

      if (year === cyear) {
        years[index].data.push([item.date, item.copies])
      } else {
        cyear = year
        years.push({
          year: cyear,
          data: [[item.date, item.copies]]
        })
        index++
      }
    })
    this.years = years
    this.yearSize = years.length
  }
  insertToDayObj (money:number) {
    let date = this.toBeInsert.date
    let rate = this.caculateParams.rate
    let singlePrice = this.toBeInsert.data[2]
    return {
      date: date,
      money: money,
      copies: (money * (100 - Number(rate)) / 100) / singlePrice
    }
  }
  getDayObj (item:string, index:number, money:number, rate:string) {
    let copies = (money * (100 - Number(rate)) / 100) / this.fundData.values[index][1]
    this.maxValue = Math.max(copies, this.maxValue)
    return {
      date: item,
      money: money,
      copies: copies
    }
  }
  @Watch('days', { deep: true })
  daysChange (nval:DayDataType[]) {
    if (nval.length > 0) {
      this.dateFlag.startDate = nval[0].date
      this.dateFlag.endDate = nval[nval.length - 1].date
    }
  }
}
</script>
