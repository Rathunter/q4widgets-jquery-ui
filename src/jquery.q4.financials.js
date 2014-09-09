/**
 * @class q4.financials
 *     @example
 *     $("#financials").financials({
 *         year: 2014,
 *         reportSubType: ['Annual Report', 'Supplemental Report']
 *     });
 *
 * @docauthor marcusk@q4websystems.com
 */
(function($) {
    $.widget('q4.financials', {
        options: {
            /**
             * @cfg
             * The year of financial reports to display.
             * Use -1 to display all years (default).
             */
            year: -1,
            /**
             * @cfg
             * A list of report subtypes to display.
             * Valid values are:
             *   Annual Report, Supplemental Report,
             *   First Quarter, Second Quarter, Third Quarter, Fourth Quarter.
             * Use an empty list to display all (default).
             */
            reportTypes: [],
            /**
             * @cfg
             * A moment.js format string with which to display report and document dates.
             */
            dateFormat: 'MM/DD/YYYY',
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
             * Use {{#years}} to loop through report years.
             * Use {{#reports}} to loop through reports.
             * Reports have these tags:
             *   {{repDate}}, {{repShortType}}, {{repTitle}}, {{repType}}, {{repYear}}
             * Within a report, use {{#docs}} to loop through documents.
             * Documents have these tags:
             *   {{docCategory}}, {{docSize}}, {{docThumbUrl}}, {{docTitle}}, {{docType}}, {{docUrl}}
             */
            template: (
                '<ul class="yearNav">' +
                    '{{#years}}<li>{{year}}</li>{{/years}}' +
                '</ul>' +
                '{{#reports}}' +
                '<div class="report" data-year="{{repYear}}">' +
                    '<h3 class="repTitle">{{repTitle}}</h3>' +
                    '<span class="repShortType">{{repShortType}}</span>' +
                    '<img class="repCover" src="{{repCoverUrl}}">' +
                    '<ul class="docs">' +
                        '{{#docs}}' +
                        '<li data-category="{{docCategory}}">' +
                            '<a href="{{docUrl}}" target="_blank">' +
                                '<span class="docDate">{{repDate}}</span>' +
                                '<span class="docTitle">{{docTitle}}</span>' +
                                '<span class="docIcon {{docType}}"></span>' +
                                '<span class="docSize">{{docSize}}</span>' +
                            '</a>' +
                        '</li>' +
                        '{{/docs}}' +
                    '</ul>' +
                '</div>' +
                '{{/reports}}'
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
                    year: o.year,
                    reportSubTypeList: o.reportSubTypes
                };

            $.ajax({
                type: 'POST',
                url: '/Services/FinancialReportService.svc/GetFinancialReportList',
                data: JSON.stringify(params),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: function(data) {
                    _.drawFinancials(data);
                }
            });
        },

        drawFinancials: function(data) {
            var _ = this,
                o = _.options,
                years = [],
                tplData = {
                    years: [],
                    reports: []
                };

            // Loop through documents for the selected year(s).
            $.each(data.GetFinancialReportListResult, function(i, report) {
                if (o.year == -1 || report.ReportYear == o.year) {
                    // Add this year to the years array if it's not there already.
                    if ($.inArray(report.ReportYear, years) == -1) {
                        years.push(report.ReportYear);
                    }

                    var tplReport = {
                        docs: [],
                        repCoverUrl: report.CoverImagePath,
                        repDate: moment(report.ReportDate, 'MM/DD/YYYY HH:mm:ss').format(o.dateFormat),
                        repShortType: o.shortTypes[report.ReportSubType],
                        repTitle: report.ReportTitle,
                        repType: report.ReportSubType,
                        repYear: report.ReportYear
                    };

                    $.each(report.Documents, function(i, doc) {
                        tplReport.docs.push({
                            docCategory: doc.DocumentCategory,
                            docSize: doc.DocumentFileSize,
                            docThumbUrl: doc.DocumentThumbnailPath,
                            docTitle: doc.DocumentTitle,
                            docType: doc.DocumentFileType,
                            docUrl: doc.DocumentPath
                        });
                    });

                    tplData.reports.push(tplReport);
                }
            });

            // Sort the years in descending order.
            years.sort(function(a, b) { return b - a });
            $.each(years, function(i, year) {
                tplData.years.push({year: year});
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
                $.getScript('//cdnjs.cloudflare.com/ajax/libs/moment.js/2.8.2/moment.min.js')
            ).done(function() {
                _.fetchFinancials();
            });
        }
    });
})(jQuery);