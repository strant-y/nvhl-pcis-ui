/**
 * 缓存组件的name
 */
const ViewsCachedKeyMap : any = {
    'guide': 'CustomRecording',
    'my-page': 'myPage',
    'factorConfig': 'factorConfig',
    'component': 'componentConfig',
    'application-querys': 'application-querys',
    'price-inquiry-recording': 'PriceInquiryRecording',
    // 'edr-qry-endorse-list': '',
};

export function getCompName(name: string): boolean {
    return ViewsCachedKeyMap[name];
}

