<template>
  <div class="dashboard">
    <h1>数据概览</h1>
    <el-row :gutter="20" class="card-row">
      <el-col :span="6">
        <el-card class="data-card">
          <div class="card-header">
            <span class="card-title">今日订单</span>
            <el-icon class="card-icon"><ShoppingCart /></el-icon>
          </div>
          <div class="card-value">128</div>
          <div class="card-footer">较昨日 +12%</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="data-card">
          <div class="card-header">
            <span class="card-title">今日营收</span>
            <el-icon class="card-icon"><Money /></el-icon>
          </div>
          <div class="card-value">¥12,580</div>
          <div class="card-footer">较昨日 +8%</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="data-card">
          <div class="card-header">
            <span class="card-title">新增用户</span>
            <el-icon class="card-icon"><User /></el-icon>
          </div>
          <div class="card-value">56</div>
          <div class="card-footer">较昨日 +23%</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="data-card">
          <div class="card-header">
            <span class="card-title">盲盒开启</span>
            <el-icon class="card-icon"><Box /></el-icon>
          </div>
          <div class="card-value">342</div>
          <div class="card-footer">较昨日 +15%</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="welcome-card">
      <template #header>
        <span>欢迎使用盲盒系统</span>
      </template>
      <p>系统已成功部署到 Render 平台！</p>
      <p>当前版本: v1.0.0</p>
      <p>部署时间: 2026-03-03</p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ShoppingCart, Money, User, Box } from '@element-plus/icons-vue'
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.card-row {
  margin-bottom: 20px;
}

.data-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .card-title {
    color: #909399;
    font-size: 14px;
  }

  .card-icon {
    font-size: 24px;
    color: #409EFF;
  }

  .card-value {
    font-size: 28px;
    font-weight: bold;
    color: #303133;
    margin-bottom: 10px;
  }

  .card-footer {
    font-size: 12px;
    color: #67C23A;
  }
}

.welcome-card {
  margin-top: 20px;
}
</style>
