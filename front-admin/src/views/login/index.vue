<template>
  <div class="login-container">
    <div class="login-content">
      <div class="title-container">
        <!--        <h3 class="title">综合管理系统</h3>-->
        <img src="../../assets/images/logo.png" alt="">
      </div>
      <el-form ref="loginForm" :model="loginForm" label-width="60px" :rules="loginRules" class="login-form" auto-complete="on">
        <el-form-item label="账号" prop="contact_number">
          <!--          <el-input-->
          <!--            ref="contact_number"-->
          <!--            v-model="loginForm.contact_number"-->
          <!--            placeholder="请输入手机号"-->
          <!--            name="contact_number"-->
          <!--            type="text"-->
          <!--            tabindex="1"-->
          <!--            auto-complete="on"-->
          <!--          >-->
          <!--            <el-select slot="prepend" v-model="loginForm.phoneArea" style="width: 80px" placeholder="请选择">-->
          <!--              <el-option-->
          <!--                v-for="item in phoneAreaOptions"-->
          <!--                :key="item.value"-->
          <!--                :label="item.label"-->
          <!--                :value="item.value"-->
          <!--              />-->
          <!--            </el-select>-->
          <!--          </el-input>-->
          <el-input
            ref="contact_number"
            v-model="loginForm.contact_number"
            placeholder="请输入账号"
            name="contact_number"
            type="text"
            tabindex="1"
            auto-complete="on"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            ref="password"
            v-model="loginForm.password"
            placeholder="请输入密码"
            name="password"
            tabindex="2"
            show-password
            type="password"
            auto-complete="on"
            @keyup.enter.native="handleLogin"
          />
        </el-form-item>

        <div style="width: 100%;margin-top: 85px;text-align: center">
          <el-button :loading="loading" type="primary" style="width:341px;height:56px;margin: 0 auto;" @click.native.prevent="handleLogin">登录</el-button>
        </div>

      </el-form>

    </div>
  </div>
</template>

<script>
import { setToken } from '@/utils/auth'

export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        phoneArea: '86',
        contact_number: '',
        code: '',
        password: ''
      },
      loginRules: {
        contact_number: [{ required: true, trigger: 'blur', message: '请输入手机号' }],
        password: [{ required: true, trigger: 'blur', message: '请输入密码' }]
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined,
      hasSendCode: false,
      timeCount: 60,
      phoneAreaOptions: [
        {
          value: '86',
          label: '+86'
        }
      ]
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  methods: {
    handleLogin() {
      this.passwordLogin()
    },
    passwordLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          const params = {
            'contact_number': this.loginForm.contact_number,
            'password': this.loginForm.password
          }
          this.$request({
            url: '/auth/login',
            method: 'post',
            data: params
          }).then(res => {
            // 登录成功
            if (res?.data) {
              sessionStorage.setItem('userInfo', JSON.stringify(res.data.user))
              setToken(res.data.token)
              this.$router.push({ path: this.redirect || '/dashboard' })
            }
            this.loading = false
            // 获取用户信息
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg:#F4F7FB;
$light_gray:#fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: #111113;
  }
}

/* reset element-ui css */
.login-container {
  background-image: url("../../assets/images/login_bg.png");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 50%;
  position: relative;
  font-family: PingFangSC-Regular, PingFang SC;

  //.el-input {
  //  //display: inline-block;
  //  height: 56px;
  //  color: #111113;
  //
  //  input {
  //    background: transparent;
  //    border: 0px;
  //    -webkit-appearance: none;
  //    border-radius: 0px;
  //    //padding: 12px 5px 12px 15px;
  //    height: 56px;
  //  }
  //}
  //.el-input-group__append, .el-input-group__prepend {
  //  border: none;
  //}
  //.el-select {
  //  border: none;
  //}

  .el-form-item {
    margin: 30px auto 0 auto;
    width: 341px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: #F4F7FB;
    border-radius: 2px;
    color: #111113;
  }
}
</style>

<style lang="scss" scoped>
$light_gray:#eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: #ffffff;
  overflow: hidden;

  .login-content {
    position: absolute;
    width: 490px;
    top: 15%;
    right: 18%;
  }

  .login-type-container {
    display: flex;
    justify-content: center;
    font-size: 20px;
    font-weight: 400;
    color: #45587B;
    line-height: 28px;
    padding-top: 101px;
    p {
      cursor: pointer;
    }

    .verify-type {
      margin-right: 70px;
    }
    .active {
      font-weight: 500;
      color: #111113;
    }

    .login-type {
      position: relative;
      &.active {
        &::after {
          content: '';
          height: 4px;
          width: 45px;
          position: absolute;
          left: 50%;
          bottom: -5px;
          transform: translateX(-50%);
          background-color: #40A7FF;
        }

      }
    }
  }

  .login-form {
    position: relative;
    width: 490px;
    //height: 631px;
    padding: 30px;
    max-width: 100%;
    background: #ffffff;
    box-shadow: 0px 2px 29px -2px rgba(195,200,248,0.53);
    border-radius: 8px;
  }

  .title-container {
    position: relative;
    text-align: center;
    margin-bottom: 47px;

    .title {
      font-size: 26px;
      color: #eee;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }
}
</style>
