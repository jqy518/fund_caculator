<template>
  <div ref="chartbox" class="chart">

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
const echarts = require('echarts')
export interface ChartData {
  name:string,
  categoryData: string[],
  values: number[][]
}
export interface DateScope {
  startDate:string | null,
  endDate:string | null
}

@Component
export default class LineChart extends Vue {
  @Prop() private dataObj!: ChartData;
  @Prop({ default: () => { return { startDate: null, endDate: null } } }) private dates!:DateScope
  private chartDom:any= null
  private myChart:any = null
  private upColor:string = '#ec0000';
  private upBorderColor:string = '#8A0000';
  private downColor:string = '#00da3c';
  private downBorderColor:string = '#008F28';
  resizeTimeout:any = false;
  mounted () {
    this.initChart()
    this.resizeThrottler = this.resizeThrottler.bind(this)
    this.chartClick = this.chartClick.bind(this)
    this.bindEvent()
  }
  beforeDestroy () {
    window.removeEventListener('resize', this.resizeThrottler, false)
  }
  @Watch('dataObj', { deep: true })
  dataChange (nval:ChartData) {
    this.setData()
  }
  @Watch('dates', { deep: true })
  datesChange (nval:DateScope) {
    this.setData()
  }
  initChart ():void {
    this.chartDom = this.$refs.chartbox
    this.myChart = echarts.init(this.chartDom)
    this.setData()
  }
  bindEvent () {
    window.addEventListener('resize', this.resizeThrottler, false)
    this.myChart.on('click', this.chartClick)
  }
  chartClick (params:any) {
    if (params.componentType === 'series' && params.componentSubType === 'candlestick') {
      this.$emit('insert', { date: params.name, data: params.data })
    }
    console.log(params)
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
  calculateMA (dayCount:number) {
    var result = []
    for (var i = 0, len = this.dataObj.values.length; i < len; i++) {
      if (i < dayCount) {
        result.push('-')
        continue
      }
      var sum = 0
      for (var j = 0; j < dayCount; j++) {
        sum += this.dataObj.values[i - j][1]
      }
      result.push(sum / dayCount)
    }
    return result
  }
  getOptions ():any {
    const option = {
      title: {
        text: this.dataObj.name,
        left: 0
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: ['日K', 'MA5', 'MA10', 'MA20', 'MA30'],
        selected: {
          '日K': true,
          'MA5': false,
          'MA10': false,
          'MA20': false,
          'MA30': false
        }
      },
      grid: {
        left: '6%',
        right: '6%',
        top: '10%',
        bottom: '15%'
      },
      xAxis: {
        type: 'category',
        data: this.dataObj.categoryData,
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        splitNumber: 20,
        min: 'dataMin',
        max: 'dataMax'
      },
      yAxis: {
        scale: true,
        splitArea: {
          show: true
        }
      },
      dataZoom: [
        {
          show: true,
          type: 'slider',
          y: '90%',
          startValue: this.dates.startDate || null,
          endValue: this.dates.endDate || null
        }
      ],
      series: [
        {
          name: '日K',
          type: 'candlestick',
          data: this.dataObj.values,
          itemStyle: {
            normal: {
              color: this.upColor,
              color0: this.downColor,
              borderColor: this.upBorderColor,
              borderColor0: this.downBorderColor
            }
          },
          markPoint: {
            label: {
              normal: {
                formatter: function (param:any) {
                  return param != null ? Math.round(param.value) : ''
                }
              }
            },
            data: [
              {
                name: 'XX标点',
                coord: ['2013/5/31', 2300],
                value: 2300,
                itemStyle: {
                  normal: { color: 'rgb(41,60,85)' }
                }
              },
              {
                name: 'highest value',
                type: 'max',
                valueDim: 'highest'
              },
              {
                name: 'lowest value',
                type: 'min',
                valueDim: 'lowest'
              },
              {
                name: 'average value on close',
                type: 'average',
                valueDim: 'close'
              }
            ],
            tooltip: {
              formatter: function (param:any) {
                return param.name + '<br>' + (param.data.coord || '')
              }
            }
          },
          markLine: {
            symbol: ['none', 'none'],
            data: [
              [
                {
                  name: 'from lowest to highest',
                  type: 'min',
                  valueDim: 'lowest',
                  symbol: 'circle',
                  symbolSize: 10,
                  label: {
                    normal: { show: false },
                    emphasis: { show: false }
                  }
                },
                {
                  type: 'max',
                  valueDim: 'highest',
                  symbol: 'circle',
                  symbolSize: 10,
                  label: {
                    normal: { show: false },
                    emphasis: { show: false }
                  }
                }
              ],
              {
                name: 'min line on close',
                type: 'min',
                valueDim: 'close'
              },
              {
                name: 'max line on close',
                type: 'max',
                valueDim: 'close'
              }
            ]
          }
        },
        {
          name: 'MA5',
          type: 'line',
          data: this.calculateMA(5),
          smooth: true,
          lineStyle: {
            normal: { opacity: 0.5 }
          }
        },
        {
          name: 'MA10',
          type: 'line',
          data: this.calculateMA(10),
          smooth: true,
          lineStyle: {
            normal: { opacity: 0.5 }
          }
        },
        {
          name: 'MA20',
          type: 'line',
          data: this.calculateMA(20),
          smooth: true,
          lineStyle: {
            normal: { opacity: 0.5 }
          }
        },
        {
          name: 'MA30',
          type: 'line',
          data: this.calculateMA(30),
          smooth: true,
          lineStyle: {
            normal: { opacity: 0.5 }
          }
        }

      ]
    }
    return option
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
