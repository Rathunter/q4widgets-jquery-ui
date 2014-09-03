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
            reportSubType: [],
            /**
             * @cfg
             * A mustache.js template for the financial report list.
             * Use {{#years}} to loop through report years.
             * Use {{#reports}} to loop through reports.
             * Reports have these tags:
             *   {{repDate}}, {{repTitle}}, {{repType}}, {{repYear}}
             * Within a report, use {{#docs}} to loop through documents.
             * Documents have these tags:
             *   {{docCategory}}, {{docSize}}, {{docThumbUrl}}, {{docTitle}}, {{docType}}, {{docUrl}}
             */
            template: (
                '<ul class="yearNav">' +
                    '{{#years}}<li>{{year}}</li>{{/years}}' +
                '</ul>' +
                '{{#reports}}' +
                '<div class="report">' +
                    '<h3>{{repTitle}}</h3>' +
                    '<ul class="docs">' +
                        '{{#docs}}' +
                        '<li>' +
                            '<a href="{{docUrl}}" target="_blank">' +
                                '<span class="docTitle">{{docTitle}}</span>' +
                                '<span class="docIcon {{docType}}"></span>' +
                            '</a>' +
                        '</li>' +
                        '{{/docs}}' +
                    '</ul>' +
                '</div>' +
                '{{/reports}}'
            )
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
                    reportSubType: o.reportSubType
                };

            $.ajax({
                type: 'POST',
                url: '/Services/FinancialReportService.svc/GetFinancialReportList',
                data: JSON2.stringify(params),
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

            $.each(data.GetFinancialReportListResult, function(i, report) {
                if ($.inArray(report.ReportYear, years) == -1) {
                    years.push(report.ReportYear);
                }

                if (o.year == -1 || o.year == report.ReportYear) {
                    var tplReport = {
                        docs: [],
                        repDate: report.ReportDate,
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

            $.each(years, function(i, year) {
                tplData.years.push({year: year});
            });

            console.log(tplData);

            _.element.append(Mustache.to_html(o.template, tplData));
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