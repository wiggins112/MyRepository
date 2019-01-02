const globalEvent = weex.requireModule('globalEvent')
const modal = weex.requireModule('modal')
const router = weex.requireModule('bmRouter')
const event = weex.requireModule('bmEvents');
/**
 * 消息推送
 * options 客户端个推推送的所有消息
 */
globalEvent.addEventListener('pushMessage', function(options) {
	console.log('pushMessage', options);
    event.emit('m-goNoticeMessages', {});        
})
