# q4.financialTable

### Creates a table of different types of financial documents sorted by year.
Each year can have links to documents for each quarter.

*Source file: `jquery.q4.financialtable.js`, line 2*  
*Author: marcusk@q4websystems.com*  
*Requires:*
- Mustache.js

Example:
```
    $("#financials").financialTable({
        year: 2014,
        reportSubType: ['Annual Report', 'Supplemental Report']
    });
```

## Options
- **columns** - *number*  
The number of year columns to display.
Set to zero to show all columns (default).  
*Example:*
```
    $("#financials").financialTable({
        year: 2014,
        reportSubType: ['Annual Report', 'Supplemental Report']
    });
```

- **firstYear** - *number&#x2F;string*  
The earliest year to display; previous years will be ignored.
Set to zero to show all years (default).  
*Example:*
```
    $("#financials").financialTable({
        year: 2014,
        reportSubType: ['Annual Report', 'Supplemental Report']
    });
```

- **categories** - *Array&lt;Object&gt;*  
A list of document categories that will appear as rows in the table.  
*Example:*
```
    $("#financials").financialTable({
        year: 2014,
        reportSubType: ['Annual Report', 'Supplemental Report']
    });
```

- **shortTypes** - *Object*  
A map of short names for each report subtype.  
*Example:*
```
    $("#financials").financialTable({
        year: 2014,
        reportSubType: ['Annual Report', 'Supplemental Report']
    });
```

- **template** - *string*  
A mustache.js template for the financial report list.
Use {{#years}} to loop through document years.
Use {{#categories}} to loop through document categories.
Categories have these tags: {{catTitle}}, {{catClass}}
Within a category, use {{#catYears}} to loop through years.
Within a year, use {{#docs}} to loop through documents.
Documents can have these tags:
  {{text}}: The value of the category's "text" option
    (which might contain any of the below tags).
  {{fileType}}: the document file type.
  {{shortType}}: the short name of the report subtype,
    as defined in options.shortTypes (e.g. Q1, Q2, Annual).
  {{size}}: the size of the document file.
  {{title}}: the title of the document.
  {{url}}: the URL of the document file.
  {{year}}: the fiscal year of the report.  
*Example:*
```
    $("#financials").financialTable({
        year: 2014,
        reportSubType: ['Annual Report', 'Supplemental Report']
    });
```

- **complete** - *function*  
A callback function that is called when rendering is completed.  
*Example:*
```
    $("#financials").financialTable({
        year: 2014,
        reportSubType: ['Annual Report', 'Supplemental Report']
    });
```


