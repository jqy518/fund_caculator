<template>
  <div ref="chartbox" class="chart">
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
const echarts = require('echarts')
export interface YearChartData {
  year:string,
  data:[string, number][]
}
@Component
export default class YearChart extends Vue {
  @Prop() private dataObj!: YearChartData[];
  @Prop() private max!:number
  @Prop() private size!:number
  private chartDom:any= null
  private myChart:any = null
  resizeTimeout:any = false;
  mounted () {
    this.initChart()
    this.resizeThrottler = this.resizeThrottler.bind(this)
    this.bindEvent()
  }
  beforeDestroy () {
    window.removeEventListener('resize', this.resizeThrottler, false)
  }
  initChart ():void {
    this.chartDom = this.$refs.chartbox
    this.myChart = echarts.init(this.chartDom)
    this.setData()
  }
  @Watch('dataObj', { deep: true })
  dataChange (nval:YearChartData) {
    this.setData()
  }
  bindEvent () {
    window.addEventListener('resize', this.resizeThrottler, false)
  }
  resizeThrottler () {
    if (!this.resizeTimeout) {
      let self = this
      this.resizeTimeout = window.setTimeout(() => {
        self.resizeTimeout = false
        if (self.myChart) {
          self.myChart.resize()
        }
      }, 500)
    }
  }
  setData () {
    let options = this.getOptions()
    this.myChart.clear()
    this.myChart.setOption(options)
  }
  getOptions () {
    let calendars:any[] = []
    let series:any[] = []
    let itemWidth = 1 / this.size * 100
    this.dataObj.forEach((element, index) => {
      let ca = {
        width: (itemWidth - 5) + '%',
        left: (itemWidth * index + 4) + '%',
        range: element.year,
        cellSize: ['auto', 15],
        yearLabel: {
          margin: 12
        }
      }
      let ss = {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        calendarIndex: index,
        data: element.data
      }
      calendars.push(ca)
      series.push(ss)
    })
    console.log(series)

    const option = {
      tooltip: {
        position: 'top'
      },
      visualMap: {
        min: 0,
        max: this.max,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        top: 'top',
        show: false
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '5%'
      },
      calendar: calendars,

      series: series
    }

    return option
  }
}

</script>
