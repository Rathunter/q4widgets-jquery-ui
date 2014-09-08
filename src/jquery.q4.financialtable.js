/**
 * @class q4.financialTable
 *     @example
 *     $("#financials").financialTable({
 *         year: 2014,
 *         reportSubType: ['Annual Report', 'Supplemental Report']
 *     });
 *
 * @docauthor marcusk@q4websystems.com
 */
(function($) {
    $.widget('q4.financialTable', {
        options: {
            /**
             * @cfg
             * The number of year columns to display.
             * Set to zero to show all columns (default).
             **/
            columns: 0,
            /**
             * @cfg
             * A list of document categories that will appear as rows in the table.
             * title: The title to display for that row.
             * reportType: A filter list of financial report subtypes (optional).
             * text: The text to use for the link (default blank). This can optionally include the following codes:
             *   {{year}}: the fiscal year of the report.
             *   {{shortType}}: the short name of the report subtype (e.g. Q1, Q2, Annual).
             * 
             */
            categories: [
                {
                    title: 'Quarterly Report',
                    reportType: ['First Quarter', 'Second Quarter', 'Third Quarter', 'Fourth Quarter'],
                    text: '{{shortType}}',
                    cssClass: 'quarterly'
                },
                {
                    title: '10-K',
                    category: ['10-K'],
                    reportType: ['Annual Report'],
                    text: '{{year}}'
                },
                {
                    title: 'Proxy Statement',
                    category: ['Proxy'],
                    text: 'Proxy'
                }
            ],
            /**
             * @cfg
             * A map of short names for each report subtype.
             */
            shortTypes: {
                'Annual Report': 'Annual',
                'Supplemental Report': 'Supplemental',
                'First Quarter': 'Q1',
                'Second Quarter': 'Q2',
                'Third Quarter': 'Q3',
                'Fourth Quarter': 'Q4'
            },
            /**
             * @cfg
             * A mustache.js template for the financial report list.
             * Use {{#years}} to loop through document years.
             * Use {{#categories}} to loop through document categories.
             * Categories have these tags: {{catTitle}}, {{catClass}}
             * Within a category, use {{#catYears}} to loop through years.
             * Within a year, use {{#docs}} to loop through documents.
             * Documents have these tags: {{docText}}, {{docType}}, {{docUrl}}
             */
            template: (
                '<ul class="ftHeader">' +
                    '<li>Document</li>' +
                    '{{#years}}<li>{{year}}</li>{{/years}}' +
                '</ul>' +
                '{{#categories}}' +
                '<ul class="ftRow {{catClass}}">' +
                    '<li>{{catTitle}}</li>' +
                    '{{#catYears}}' +
                    '<li>' +
                        '{{#docs}}<a href="{{docUrl}}" class="docLink {{docType}}">{{docText}}</a>{{/docs}}' +
                    '</li>' +
                    '{{/catYears}}' +
                '</ul>' +
                '{{/categories}}'
            ),
            /**
            * @cfg
            * A callback function that is called when rendering is completed.
            */
            complete: null
        },

        fetchFinancials: function() {
            var _ = this,
                o = _.options,
                params = {
                    serviceDto: {
                        ViewType: GetViewType(),
                        ViewDate: GetViewDate(),
                        RevisionNumber: GetRevisionNumber(),
                        LanguageId: GetLanguageId(),
                        Signature: GetSignature()
                    },
                    year: -1,
                    reportSubTypeList: o.reportSubType
                };

            $.ajax({
                type: 'POST',
                url: '/Services/FinancialReportService.svc/GetFinancialReportList',
                data: JSON.stringify(params),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: function(data) {
                    _.drawFinancialTable(data);
                }
            });
        },

        drawFinancialTable: function(data) {
            var _ = this,
                o = _.options,
                years = [],
                documents = {},
                tplData = {
                    years: [],
                    categories: []
                };

            // Create a list of years.
            $.each(data.GetFinancialReportListResult, function(i, report) {
                if ($.inArray(report.ReportYear, years) == -1) {
                    years.push(report.ReportYear);
                }
            });
            // Sort in descending order.
            years.sort(function(a, b) { return b - a });
            // Clip years to the number of columns specified.
            if (o.columns > 0) {
                years = years.slice(0, o.columns);
            }

            // Create a document object indexed by category and year.
            $.each(o.categories, function(i, cat) {
                documents[cat.title] = {};
                $.each(years, function(i, year) {
                    documents[cat.title][year] = [];
                });
            });

            // Loop through all documents for the selected years, and add them to the data object.
            $.each(data.GetFinancialReportListResult, function(i, report) {
                if ($.inArray(report.ReportYear, years) == -1) return true;

                $.each(report.Documents, function(i, doc) {
                    $.each(o.categories, function(i, cat) {
                        // Skip categories that don't match this document.
                        if (cat.hasOwnProperty('category') && cat.category.length && cat.category != doc.DocumentCategory) return true;
                        if (cat.hasOwnProperty('reportType') && cat.reportType.length && cat.reportType != report.ReportSubType) return true;

                        // Add the document to the data object in the correct category and year.
                        documents[cat.title][report.ReportYear].push({
                            docText: cat.hasOwnProperty('text') ? cat.text
                                .replace('{{year}}', report.ReportYear)
                                .replace('{{shortType}}', o.shortTypes[report.ReportSubType])
                                : '',
                            docType: doc.DocumentFileType,
                            docUrl: doc.DocumentPath
                        });
                    });
                });
            });

            // Restructure the data for Mustache.
            $.each(years, function(i, year) {
                tplData.years.push({year: year});
            });

            $.each(o.categories, function(i, cat) {
                var tplCat = {
                    catTitle: cat.title,
                    catClass: cat.hasOwnProperty('cssClass') ? cat.cssClass : '',
                    catYears: []
                };
                $.each(years, function(i, year) {
                    if (documents[cat.title].hasOwnProperty(year)) {
                        // Push the documents in reverse (i.e. ascending) order.
                        documents[cat.title][year].reverse();
                        tplCat.catYears.push({'docs': documents[cat.title][year]});
                    } else {
                        tplCat.catYears.push({'docs': []});
                    }
                });
                tplData.categories.push(tplCat);
            });

            // Render the template and append it to the element.
            _.element.append(Mustache.to_html(o.template, tplData));

            // Fire the complete callback.
            if (typeof o.complete === 'function') {
                o.complete();
            }
        },

        _create: function() {
            $.ajaxSetup({cache: true});

            var _ = this;
            
            $.when(
                $.getScript('//cdnjs.cloudflare.com/ajax/libs/mustache.js/0.8.1/mustache.min.js'),
                $.getScript('//cdnjs.cloudflare.com/ajax/libs/json2/20130526/json2.min.js')
            ).done(function() {
                _.fetchFinancials();
            });
        }
    });
})(jQuery);