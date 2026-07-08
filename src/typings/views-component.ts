/**
 * 缓存组件的name
 */
const ViewsCachedKeyMap : any = {
    'guide': 'CustomRecording',
    'pricePage': 'price-page',
    'myPage': 'myPage',
    'factorConfig': 'factorConfig',
    'component': 'componentConfig',
    'price-inquiry-recording': 'PriceInquiryRecording',
    // 'edr-qry-endorse-list': '',
    'posite-page': 'posite-page',
    'PendUdrListQuery': 'PendUdrListQuery',
    'InquiryUdrListQuery': 'InquiryUdrListQuery',
    'orderProcessing': 'orderProcessing',
};

export function getCompName(name: string): string {
    return ViewsCachedKeyMap[name];
}
