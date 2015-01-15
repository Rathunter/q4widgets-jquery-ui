# q4.chart

### A preconfigured stock chart, using the Highstock plugin.

*Source file: `jquery.q4.chart.js`, line 2*  
*Author(s): jasonm@q4websystems.com marcusk@q4websystems.com *  
*Requires:*
- Highstock


## Options
- **url** - *string*  
The base URL of the Q4 website.  
*Example:* ` //feeds.q4websystems.com`  

- **usePublic** - *boolean*  
Whether to use the public feed (true) or the private API (false).  
*Default:* `true`  
*Example:* ` //feeds.q4websystems.com`  

- **apiKey** - *string*  
If `usePublic` is `true`, the API key to use for public feeds.  
*Example:* ` //feeds.q4websystems.com`  

- **stocks** - *string&#x2F;Array.&lt;string&gt;*  
An array of stock symbols to use on the stock price chart.
Each symbol can be a string of the format "EXCHANGE:SYMBOL",
or an array containing "EXCHANGE:SYMBOL" and a custom
display name.  
*Example:* ` 'NYSE:XXX'`  

- **lockStock** - *boolean*  
Whether to prevent stock price charts from being toggled off.  
*Default:* `false`  
*Example:* ` //feeds.q4websystems.com`  

- **showSymbolInLegend** - *boolean*  
Whether to show the stock quote in the chart legend.  
*Default:* `true`  
*Example:* ` //feeds.q4websystems.com`  

- **stockLimit** - *number*  
The maximum number of data points to fetch for the stock chart.  
*Default:* `1500`  
*Example:* ` //feeds.q4websystems.com`  

- **volume** - *boolean*  
Whether to include a volume chart below the stock price chart.  
*Default:* `false`  
*Example:* ` //feeds.q4websystems.com`  

- **volumeHeight** - *number*  
The height of the volume chart, as a percentage.  
*Default:* `40`  
*Example:* ` //feeds.q4websystems.com`  

- **news** - *boolean*  
Whether to include a series of flags for press releases.  
*Default:* `false`  
*Example:* ` //feeds.q4websystems.com`  

- **newsOnLoad** - *boolean*  
If `news` is true, whether to show news flags on initial load.  
*Default:* `false`  
*Example:* ` //feeds.q4websystems.com`  

- **newsLimit** - *number*  
If `news` is true, the maximum number of news items to display.  
*Default:* `200`  
*Example:* ` //feeds.q4websystems.com`  

- **newsLength** - *number*  
If `news` is true, the maximum length of each news headline.  
*Default:* `75`  
*Example:* ` //feeds.q4websystems.com`  

- **newsCategory** - *string*  
If `news` is true, the news category ID to use.
The default is to load all categories.  
*Default:* `"00000000-0000-0000-0000-000000000000"`  
*Example:* ` //feeds.q4websystems.com`  

- **newsTags** - *Array&lt;string&gt;*  
If `news` is true, an array of tags to filter news releases by.  
*Example:* ` //feeds.q4websystems.com`  

- **events** - *boolean*  
Whether to include a series of flags for events.  
*Default:* `false`  
*Example:* ` //feeds.q4websystems.com`  

- **eventsOnLoad** - *boolean*  
If `events` is true, whether to show event flags on initial load.  
*Default:* `false`  
*Example:* ` //feeds.q4websystems.com`  

- **eventsLimit** - *number*  
If `events` is true, the maximum number of events to display.  
*Default:* `100`  
*Example:* ` //feeds.q4websystems.com`  

- **stockOpts** - *Object*  
A set of Highcharts options for the stock price series.  
*Example:* ` //feeds.q4websystems.com`  

- **volumeOpts** - *Object*  
A set of Highcharts options for the volume series.  
*Example:* ` //feeds.q4websystems.com`  

- **newsOpts** - *Object*  
A set of Highcharts options for the press release series.  
*Example:* ` //feeds.q4websystems.com`  

- **eventsOpts** - *Object*  
A set of Highcharts options for the event series.  
*Example:* ` //feeds.q4websystems.com`  

- **highstock** - *Object*  
A set of general Highcharts options to use for the chart.  
*Default:* `{chart: {height: 400, marginTop: 60}, legend: {enabled: true, align: 'left', verticalAlign: 'top', floating: true}, rangeSelector: {enabled: true, selected: 1}, navigator: {height: 40}, credits: {enabled: true, text: "Q4 Web Systems", href: "http://www.q4websystems.com"}}`  
*Example:* ` //feeds.q4websystems.com`  

- **highchartsOpts** - *Object*  
A set of Highcharts configuration options.  
*Default:* `{global: {useUTC: false}}`  
*Example:* ` //feeds.q4websystems.com`  

- **onComplete** - *function*  
A callback that is fired after the chart is rendered.  
*Parameters:*
    - **event** - *Event*  
    The event object.
*Example:* ` //feeds.q4websystems.com`  


