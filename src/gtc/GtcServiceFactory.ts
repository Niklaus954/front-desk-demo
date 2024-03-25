import IGtcService from "./IGtcService";
import GtcServiceSocketIOImpl from "./GtcServiceSocketIOImpl";

/**
 * 远程gtc服务工厂
 */
class GtcServiceFactory {
    private static gtcService: IGtcService;

    public static getGtcService() {
        if (!GtcServiceFactory.gtcService) {
            GtcServiceFactory.gtcService = new GtcServiceSocketIOImpl();
        }
        return GtcServiceFactory.gtcService;
    }
}

export default GtcServiceFactory;