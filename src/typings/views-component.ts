/**
 * 缓存组件的name
 */
const ViewsCachedKeyMap : any = {
    'guide': 'CustomRecording',
    'pricePage': 'price-page',
    'myPage': 'myPage',
    'factorConfig': 'factorConfig',
    'component': 'componentConfig',
    'application-querys': 'application-querys',
    'price-inquiry-recording': 'PriceInquiryRecording',
    // 'edr-qry-endorse-list': '',
    'posite-page': 'posite-page',
    'classification-querys': 'classification-querys',
    'PendUdrListQuery': 'PendUdrListQuery',
    'InquiryUdrListQuery': 'InquiryUdrListQuery',
    'orderProcessing': 'orderProcessing',
    'composite-query-page': 'query-page',
};

export function getCompName(name: string): string {
    return ViewsCachedKeyMap[name];
}

