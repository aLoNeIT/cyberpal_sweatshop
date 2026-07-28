-- ============================================================================
-- File: 07-permission.sql
-- Source: 从 hongshan_cloudscript/document/sql/initialization/24-permission.sql 迁移并适配
-- Date: 2026-07-28
-- Adapt: 去掉红杉多租户角色授权（集团端/药店端/渠道端/开方机构端），
--        仅保留管理后台（app_type=1）超管角色（r_id=1）全量授权。
-- Note: 超管 r_level=0 在 PermissionMiddleware 中直接全放行，
--       此处授权为防御性数据完整性保留。
-- ============================================================================

-- 管理后台超管角色全量授权
delete from `cs_role_permission` where rp_role = 1 and rp_app_type = 1;

insert into `cs_role_permission`(`rp_role`, `rp_function_code`, `rp_app_type`)
select 1, fn_code, 1
from `cs_function`
where fn_app_type = 1;
