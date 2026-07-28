<?php

declare(strict_types=1);

namespace app\http\home\controller\v1;

use app\common\constants\CommonConst;
use app\common\logic\CacheConstLogic;
use app\common\logic\CaptchaLogic;
use app\common\util\JsonTable;
use app\http\home\controller\BaseController;
use Hyperf\Contract\SessionInterface;
use Hyperf\Di\Annotation\Inject;
use Hyperf\HttpMessage\Stream\SwooleStream;
use Psr\Http\Message\ResponseInterface as PsrResponseInterface;

/**
 * 验证码控制器。
 *
 * GET /home/v1/captcha?app_type=1
 * 返回 PNG 验证码图片，同时将 captcha key 存入 Session。
 */
class CaptchaController extends BaseController
{
    #[Inject]
    protected SessionInterface $session;

    /**
     * 获取登录验证码图片。
     *
     * @return JsonTable|PsrResponseInterface
     */
    public function index(): JsonTable|PsrResponseInterface
    {
        $appType = $this->resolveAppType();
        $captcha = CaptchaLogic::instance()->create();
        if (! $captcha->isSuccess()) {
            return $captcha;
        }

        $data = is_array($captcha->data) ? $captcha->data : [];
        $key  = (string) ($data['key'] ?? '');
        if ($key !== '') {
            $this->session->set(CacheConstLogic::getLoginCaptchaKey($appType), $key);
        }

        $image = (string) ($data['img'] ?? '');
        $base64Image = preg_replace('/^data:image\/[^;]+;base64,/', '', $image) ?? '';
        $imageBinary = base64_decode($base64Image, true);
        if ($imageBinary === false) {
            return JsonTable::withError('captcha image invalid');
        }

        return $this->response->withHeader('Content-Type', 'image/png')
            ->withHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
            ->withBody(new SwooleStream($imageBinary));
    }

    /**
     * 解析验证码所属应用类型。
     */
    private function resolveAppType(): int
    {
        $appType = (int) $this->request->query('app_type', CommonConst::APP_TYPE_ADMIN);

        return array_key_exists($appType, CommonConst::APP_TYPE_MAP)
            ? $appType
            : CommonConst::APP_TYPE_ADMIN;
    }
}
