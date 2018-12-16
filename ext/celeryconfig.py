#!/usr/bin/env python
# -*- coding: utf-8 -*-

# 使用Redis作为消息代理
BROKER_URL = "redis://10.2.0.49:6380/10"

# 把任务结果存在了Redis
CELERY_RESULT_BACKEND = "redis://10.2.0.49:6380/11"

# 任务序列化和反序列化使用msgpack方案
CELERY_TASK_SERIALIZER = "msgpack"

# 读取任务结果一般性能要求不高，所以使用了可读性更好的JSON
CELERY_RESULT_SERIALIZER = "json"

# 任务过期时间，不建议直接写86400，应该让这样的magic数字表述更明显
CELERY_TASK_RESULT_EXPIRES = 60 * 60 * 24
CELERYD_FORCE_EXECV = True

CELERY_ACCEPT_CONTENT = ["pickle", "json", "msgpack"]

CELERY_TIMEZONE = "Asia/Shanghai"
CELERY_ENABLE_UTC = False
