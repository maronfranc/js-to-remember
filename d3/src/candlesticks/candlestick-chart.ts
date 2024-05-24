import * as d3 from 'd3';
import { CandlestickData, generateCandlesticks } from './generate-candlesticks';

interface CandlestickOption {
  width: number;
  height: number;
  yDomainPosition?: 'left' | 'right';
  xFormat?: string;
  yFormat?: string;
  xPadding?: number;
  color?: {
    candleLong: string;
    wickLong: string;
    candleShort: string;
    wickShort: string;
  };
}

const DEFAULT_COLOR = {
  candleLong: 'green',
  candleShort: 'red',
  wickLong: 'olive',
  wickShort: 'maroon',
} as const;

/** Every other Monday */
function weeks(start: string | Date, stop: string | Date, stride: number) {
  return d3.utcMonday.every(stride ?? 1)!.range(new Date(start), new Date(+stop + 1));
}
function weekdays(start: Date, stop: Date) {
  return d3.utcDays(start, new Date(+stop + 1))
    .filter((d) => d.getUTCDay() !== 0 && d.getUTCDay() !== 6);
}

function draw(data: CandlestickData[], opt = {} as CandlestickOption) {
  if (!Array.isArray(data) || data.length === 0) return null;

  const marginTop = 0;
  const marginLeft = 0;
  const marginRight = opt.yDomainPosition === 'left' ? 0 : 40;
  const marginBottom = 20;
  let {
    width,
    height,
    color = DEFAULT_COLOR,
    xPadding = 0.2,
    xFormat = "%Y/%m/%d", // a format specifier for the date on the x-axis
    yFormat = "~f", // a format specifier for the value on the y-axis
    yDomainPosition = 'right',
  } = opt;

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  // X domain.
  const X = d3.map(data, (d) => d.date);
  const xDomain = weekdays(d3.min(X)!, d3.max(X)!);
  const xRange = [marginLeft, width - marginRight];
  const xScale = d3.scaleBand(xDomain!, xRange).padding(xPadding);
  /** array of x-values to label */
  const xTicks = weeks(d3.min(xDomain)!, d3.max(xDomain)!, 1);
  const xAxis = d3
    .axisBottom(xScale)
    .tickFormat(d3.utcFormat(xFormat))
    .tickValues(xTicks);
  svg.append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(xAxis)
    .call((g) => g.select(".domain").remove());

  // Y domain, labels and lines.
  const Yhigh = d3.map(data, (d) => d.high);
  const Ylow = d3.map(data, (d) => d.low);
  /** [yMin, yMax] */
  const yDomain = [d3.min(Ylow)!, d3.max(Yhigh)!];
  /** [bottom, top] */
  const yRange = [height - marginBottom, marginTop];
  const yScale = d3.scaleLinear(yDomain!, yRange);
  const yAxis = d3.axisLeft(yScale).ticks(height / 40, yFormat);
  const gTick = svg.append("g")
    .call(yAxis)
    .call((g) => g.select(".domain").remove())
    .call((g) => g.selectAll(".tick line").clone()
      .attr("stroke-opacity", 0.2)
      .attr("x2", width - marginLeft - marginRight)
    );
  if (yDomainPosition === 'left') {
    gTick.attr("transform", `translate(${marginLeft},0)`)
  } else {
    const PADDING = 5;
    gTick.attr("transform", `translate(${width - marginRight},0) scale(-1, 1)`)
      .call((g) =>
        g.selectAll(".tick text")
          .attr("transform", `translate(-${PADDING + marginRight},0) scale(-1, 1)`)
      );
  }

  // Candlesticks
  const x = d3.scaleBand()
    .domain(data.map((d) => d.date.toString()))
    .range([0, width]);
  const y = d3.scaleLinear()
    .domain([d3.min(data, (d) => d.low)!, d3.max(data, (d) => d.high)!])
    .range([height, 0]);
  const candleWidth = x.bandwidth() * 0.7;
  const wickWidth = candleWidth / 5;
  function candleXPosition(x: d3.ScaleBand<string>, d: CandlestickData) {
    return x(d.date.toString())! + (x.bandwidth() - candleWidth) / 2;
  }
  function wickXPosition(d: CandlestickData) {
    return candleXPosition(x, d) + (candleWidth / 2);
  }
  const gCandle = svg.append('g')
    .selectAll('.candle')
    .attr('class', 'candle')
    .data(data)
    .enter()
    .append('g')
    .attr("transform", `translate(-${marginRight + 5} ,0)`);
  gCandle
    .append('rect')
    .attr('class', 'wick')
    .attr('x', wickXPosition)
    .attr('y', (d) => y(d.high))
    .attr('width', wickWidth)
    .attr('height', (d) => y(d.low) - y(d.high))
    .attr('fill', (d) => d.open > d.close ? color.wickShort : color.wickLong);
  gCandle
    .append('rect')
    .attr('class', 'candle')
    .attr('x', (d) => candleXPosition(x, d))
    .attr('y', (d) => y(Math.max(d.open, d.close)))
    .attr('width', candleWidth)
    .attr('height', (d) => Math.abs(y(d.open) - y(d.close)))
    .attr('fill', (d) => d.open > d.close ? color.candleShort : color.candleLong);

  return svg.node();
}

const container = document.getElementById('candlestick_grid');
const candlesticks = generateCandlesticks();

const chartNode = draw(candlesticks, { width: 640, height: 500 })
if (chartNode) container?.appendChild(chartNode);
