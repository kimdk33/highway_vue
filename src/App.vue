<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <div class="site-title">이름추천좀</div>
    <div class="header-center">
      <nav>
        <RouterLink to="/">홈</RouterLink>
        <RouterLink to="/stream">스트림</RouterLink>
        <RouterLink to="/api-docs">API 문서</RouterLink>
      </nav>
    </div>
    <div class="header-icon">
      <i class="fas fa-car" style="color:#007bff;"></i>
      <i class="fas fa-bus" style="color:#28a745;"></i>
      <i class="fas fa-truck" style="color:#ffc107;"></i>
      <i class="fas fa-motorcycle" style="color:#dc3545;"></i>
    </div>
  </header>

  <RouterView />

  <footer>
    <p>&copy; 2025 사이트명칸. All Rights Reserved.</p>
  </footer>
</template>

<style scoped>
header {
  background-color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.site-title {
  font-size: 1.8em;
  font-weight: bold;
  color: #007bff;
}

.header-icon i {
  font-size: 1.5em;
  margin-left: 5px;
}

nav {
  display: flex;
  gap: 1rem;
}

nav a {
  color: #333;
  text-decoration: none;
  font-size: 1rem;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

nav a:hover {
  background-color: #e9ecef;
}

nav a.router-link-exact-active {
  color: #007bff;
  font-weight: bold;
}

footer {
  text-align: center;
  padding: 15px;
  margin-top: 20px;
  color: #6c757d;
  font-size: 0.9em;
}
</style>
