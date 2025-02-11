import * as d3 from 'd3';
import { CandlestickData, generateCandlesticks } from './generate-candlesticks-data';

interface CandlestickConfig {
  width: number;
  height: number;
  yDomainPosition?: 'left' | 'right';
  /** 
  * A format specifier for the date on the x-axis.
  * @see https://d3js.org/d3-time-format
  */
  xFormat?: string;
  /** 
  * A format specifier for the price on the y-axis.
  * @see https://d3js.org/d3-format
  */
  yFormat?: string;
  xPadding?: number;
  color?: {
    candleLong: string;
    wickLong: string;
    candleShort: string;
    wickShort: string;
    neutral: string;
  };
}

class CandlestickD3Helper {
  private width: number;
  private height: number;
  private yDomainPosition: 'left' | 'right';
  private xFormat: string;
  private yFormat: string;
  private xPadding: number;
  private color: {
    candleLong: string;
    wickLong: string;
    candleShort: string;
    wickShort: string;
    neutral: string;
  };
  private marginTop: number;
  private marginLeft: number;
  /** NOTE: if you change this value you may hide y domain by accident. */
  private marginRight: number;
  /** NOTE: if you change this value you may hide x domain by accident. */
  private marginBottom: number;

  constructor(config: CandlestickConfig) {
    this.width = config.width;
    this.height = config.height;

    this.color = config.color ?? {
      candleLong: 'green',
      candleShort: 'red',
      wickLong: 'olive',
      wickShort: 'maroon',
      neutral: 'gray',
    };
    this.xPadding = config.xPadding ?? 0.2;;
    this.xFormat = config.xFormat ?? "%Y/%m/%d";
    this.yFormat = config.yFormat ?? "~f";
    this.yDomainPosition = config.yDomainPosition ?? "right";

    this.marginTop = 0;
    this.marginLeft = 0;
    this.marginRight = this.yDomainPosition === 'left' ? 0 : 40;
    this.marginBottom = 20;
  }

  private createResponsiveSvg(width: number, height: number) {
    const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");
    return svg;
  }

  /** Array of x-values to label. Every other Monday */
  private buildWeeksLabels(start: string | Date, stop: string | Date, stride: number) {
    return d3.utcMonday.every(stride ?? 1)!.range(new Date(start), new Date(+stop + 1));
  }

  private buildWeekdaysLabels(start: Date, stop: Date) {
    return d3.utcDays(start, new Date(+stop + 1))
      .filter((d) => d.getUTCDay() !== 0 && d.getUTCDay() !== 6);
  }

  /** Add X domain, labels and lines. */
  private addTimeDomain(
    svg: d3.Selection<SVGSVGElement, undefined, null, undefined>,
    data: CandlestickData[],
  ) {
    const {
      width,
      height,
      xPadding,
      xFormat,
      marginLeft,
      marginBottom,
      marginRight,
    } = this;

    const X = d3.map(data, (d) => d.date);
    const xDomain = this.buildWeekdaysLabels(d3.min(X)!, d3.max(X)!);
    const xRange = [marginLeft, width - marginRight];
    const xScale = d3.scaleBand(xDomain, xRange).padding(xPadding);
    const xTicks = this.buildWeeksLabels(d3.min(xDomain)!, d3.max(xDomain)!, 1);
    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat(d3.utcFormat(xFormat))
      .tickValues(xTicks);
    svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(xAxis)
      .call((g) => g.select(".domain").remove());
  }

  /** Add Y domain, labels and lines. */
  private addPriceDomain(
    svg: d3.Selection<SVGSVGElement, undefined, null, undefined>,
    data: CandlestickData[],
  ) {
    const {
      width,
      height,
      yFormat,
      yDomainPosition,
      marginLeft,
      marginRight,
      marginBottom,
      marginTop,
    } = this;

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
      gTick.attr("transform", `translate(${marginLeft},0)`);
    } else {
      const PADDING = 5;
      gTick.attr("transform", `translate(${width - marginRight},0) scale(-1, 1)`)
        .call((g) =>
          g.selectAll(".tick text")
            .attr("transform", `translate(-${PADDING + marginRight},0) scale(-1, 1)`)
        );
    }
  }

  private addCandlesticks(
    svg: d3.Selection<SVGSVGElement, undefined, null, undefined>,
    data: CandlestickData[],
  ) {
    const {
      color,
      width,
      height,
      marginRight,
    } = this;
    const x = d3.scaleBand()
      .domain(data.map((d) => d.date.toString()))
      .range([0, width]);
    const y = d3.scaleLinear()
      .domain([d3.min(data, (d) => d.low)!, d3.max(data, (d) => d.high)!])
      .range([height, 0]);
    const candleWidth = x.bandwidth() * 0.7;
    const wickWidth = candleWidth / 5;
    function candleXPosition(
      x: d3.ScaleBand<string>,
      d: Pick<CandlestickData, "date">,
    ) {
      return x(d.date.toString())! + (x.bandwidth() - candleWidth) / 2;
    }
    function wickXPosition(d: Pick<CandlestickData, "date">) {
      return candleXPosition(x, d) + (candleWidth / 2);
    }
    // Create container
    const gCandle = svg.append('g')
      .selectAll('.candle')
      .attr('class', 'candle')
      .data(data)
      .enter()
      .append('g');
    // Add margin to the container position.
    gCandle.attr("transform", `translate(-${marginRight + 5}, 0)`);
    // Add candlesticks wick
    gCandle
      .append('rect')
      .attr('class', 'wick')
      .attr('x', wickXPosition)
      .attr('y', (d) => y(d.high))
      .attr('width', wickWidth)
      .attr('height', (d) => y(d.low) - y(d.high))
      .attr('fill', (d) => d.open > d.close ? color.wickShort : color.wickLong);
    // Add candlesticks body.
    gCandle
      .append('rect')
      .attr('class', 'candle')
      .attr('x', (d) => candleXPosition(x, d))
      .attr('y', (d) => y(Math.max(d.open, d.close)))
      .attr('width', candleWidth)
      .attr('height', (d) => {
        // if (d.open !== d.close) {
        //   // Add body if candle open and close with the same value.
        //   return Math.abs(y(d.open) - y(d.close + 1));
        // }
        return Math.abs(y(d.open) - y(d.close));
      })
      .attr('fill', (d) => {
        if (d.open < d.close) return color.candleLong;
        if (d.open > d.close) return color.candleShort
        return color.neutral;
      });
  }

  draw(data: CandlestickData[]) {
    if (!Array.isArray(data) || data.length === 0) return null;

    const svg = this.createResponsiveSvg(this.width, this.height);
    this.addTimeDomain(svg, data)
    this.addPriceDomain(svg, data)
    this.addCandlesticks(svg, data);

    return svg.node();
  }
}

const container = document.getElementById('candlestick_grid');
const testCandlesticks = generateCandlesticks();


if (container) {
  const chartNode = new CandlestickD3Helper({
    width: 640,
    height: 500,
  }).draw(testCandlesticks);


  container.appendChild(chartNode);
} else {
  console.error("Container not defined.");
}
