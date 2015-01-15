# q4.financials

### Fetches and displays financial reports from the Q4 private API.

*Source file: `jquery.q4.api.js`, line 676*  



## Options
- **reportTypes** - *Array&lt;string&gt;*  
A list of report subtypes to display.
Valid values are:
- `Annual Report`
- `Supplemental Report`
- `First Quarter`
- `Second Quarter`
- `Third Quarter`
- `Fourth Quarter`
Use an empty list to display all.  

- **docCategories** - *Array&lt;string&gt;*  
A list of document categories to display.
Use an empty list to display all.  
*Example:* ` ["Financial Report", "MD&A", "Earnings Press Release"]`  

- **shortTypes** - *Object*  
A map of short names for each report subtype,
for use in the template.  


