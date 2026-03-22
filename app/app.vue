<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { Send, Bot, User, Loader2, Plus, Settings, Github, MessageSquare, Search, Info, HelpCircle, Cpu, Sparkles } from 'lucide-vue-next'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>';
      } catch (__) {}
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
})

const messages = ref([
  { role: 'assistant', content: 'Xin chào! Tôi là AI Agent có hỗ trợ RAG. Tôi có thể giúp gì cho bạn?' }
])
const input = ref('')
const isLoading = ref(false)
const chatContainer = ref(null)
const textarea = ref(null)

const suggestions = [
  { icon: Search, label: 'So sánh iPhone 15 Pro Max và Samsung S24 Ultra' },
  { icon: Info, label: 'Cấu hình chi tiết của ASUS ROG Phone 8' },
  { icon: HelpCircle, label: 'Chính sách bảo hành của Google Pixel 8 Pro' },
  { icon: Cpu, label: 'Điện thoại nào có RAM 24GB?' }
]

const showLanding = computed(() => messages.value.length <= 1)

const renderMarkdown = (content) => {
  return md.render(content)
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTo({
      top: chatContainer.value.scrollHeight,
      behavior: 'smooth'
    })
  }
}

const adjustTextareaHeight = () => {
  if (textarea.value) {
    textarea.value.style.height = 'auto'
    textarea.value.style.height = Math.min(textarea.value.scrollHeight, 200) + 'px'
  }
}

const useSuggestion = (label) => {
  input.value = label
  sendMessage()
}

const sendMessage = async () => {
  if (!input.value.trim() || isLoading.value) return

  const userMessage = input.value
  messages.value.push({ role: 'user', content: userMessage })
  input.value = ''
  if (textarea.value) textarea.value.style.height = 'auto'
  
  isLoading.value = true
  scrollToBottom()

  try {
    const data = await $fetch('/api/chat', {
      method: 'POST',
      body: { 
        prompt: userMessage,
        history: messages.value.slice(0, -1)
      }
    })

    messages.value.push({ 
      role: 'assistant', 
      content: data.response || 'Xin lỗi, không có phản hồi từ AI.'
    })
  } catch (err) {
    console.error(err)
    messages.value.push({ 
      role: 'assistant', 
      content: 'Đã có lỗi xảy ra. Vui lòng kiểm tra API key và kết nối database.' 
    })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

const startNewChat = () => {
  messages.value = [
    { role: 'assistant', content: 'Xin chào! Tôi có thể giúp gì cho bạn?' }
  ]
}
</script>

<template>
  <div class="flex h-screen bg-[#0b0e14] text-white overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-68 border-r border-white/5 bg-[#0d1117] hidden md:flex flex-col shrink-0">
      <div class="p-4">
        <button 
          @click="startNewChat"
          class="w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all duration-300 text-sm font-medium mb-4 group"
        >
          <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus :size="18" />
          </div>
          New Chat
        </button>
      </div>
      <div class="flex-1 overflow-y-auto px-4 space-y-2 pb-4 scrollbar-hide">
        <div class="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-3">Recent Chats</div>
        <div v-for="i in 5" :key="i" class="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer text-sm text-gray-400 transition-all border border-transparent hover:border-white/5">
          <MessageSquare :size="16" class="shrink-0 opacity-50 group-hover:opacity-100" />
          <span class="truncate">Cuộc hội thoại mẫu {{ i }}</span>
        </div>
      </div>
      <div class="p-4 border-t border-white/5 bg-[#0d1117]/80 backdrop-blur-md">
        <button class="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 text-sm text-gray-400 hover:text-white transition-all">
          <Settings :size="18" /> Settings
        </button>
      </div>
    </aside>

    <!-- Main Chat Area -->
    <main class="flex-1 flex flex-col relative bg-[#0b0e14]">
      <!-- Header -->
      <header class="h-16 border-b border-white/5 bg-[#0b0e14]/50 backdrop-blur-xl sticky top-0 z-10 flex items-center justify-between px-6">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles :size="20" class="text-white" />
          </div>
          <div>
            <h1 class="text-sm font-bold tracking-tight text-white">RAG Intelligence <span class="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded ml-1 font-normal border border-blue-500/30">v2.0</span></h1>
            <p class="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Systems Online
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button class="p-2 rounded-lg hover:bg-white/5 text-gray-400 transition-colors">
            <Github :size="18" />
          </button>
        </div>
      </header>

      <!-- Messages Container -->
      <div class="flex-1 overflow-y-auto relative scrollbar-hide" ref="chatContainer">
        <!-- Landing State -->
        <transition 
          enter-active-class="transition duration-700 ease-out"
          enter-from-class="opacity-0 translate-y-8"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div v-if="showLanding" class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-0">
            <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-8 animate-bounce-slow">
              <Bot :size="48" class="text-white" />
            </div>
            <h2 class="text-3xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent tracking-tight">
              Làm thế nào tôi có thể giúp bạn?
            </h2>
            <p class="text-gray-400 max-w-lg mb-12 leading-relaxed font-medium">
              Hệ thống RAG thông minh của tôi đã sẵn sàng phân tích kho dữ liệu điện thoại để trả lời mọi câu hỏi của bạn.
            </p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-3xl">
              <button 
                v-for="s in suggestions" 
                :key="s.label"
                @click="useSuggestion(s.label)"
                class="flex items-center gap-3 p-4 rounded-2xl bg-[#1a1c23] border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-300 text-left group"
              >
                <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                  <component :is="s.icon" :size="20" class="text-gray-400 group-hover:text-blue-400" />
                </div>
                <span class="text-sm font-medium text-gray-300 group-hover:text-white">{{ s.label }}</span>
              </button>
            </div>
          </div>
        </transition>

        <!-- Message List -->
        <div v-if="!showLanding" class="max-w-4xl mx-auto p-4 md:p-8 space-y-8 pt-12">
          <div v-for="(msg, idx) in messages" :key="idx" 
               class="flex gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
               :class="msg.role === 'user' ? 'flex-row-reverse' : ''">
            <div class="w-9 h-9 md:w-11 md:h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xl transition-transform hover:scale-110"
                 :class="msg.role === 'user' ? 'bg-gradient-to-br from-blue-600 to-indigo-700 border border-white/10' : 'bg-[#1a1c23] border border-white/10'">
              <User v-if="msg.role === 'user'" :size="22" />
              <Bot v-else :size="22" class="text-blue-400" />
            </div>
            <div class="flex-1 min-w-0 max-w-[85%] md:max-w-[75%]">
              <div class="flex items-center gap-2 mb-2" :class="msg.role === 'user' ? 'flex-row-reverse text-right' : ''">
                <span class="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                  {{ msg.role === 'user' ? 'Bạn' : 'AI Assistant' }}
                </span>
                <span v-if="msg.role === 'assistant'" class="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[9px] font-bold uppercase border border-blue-500/20">RAG Enabled</span>
              </div>
              <div class="rounded-3xl px-6 py-5 text-[15px] shadow-2xl relative"
                   :class="msg.role === 'user' ? 'bg-blue-600/10 border border-blue-500/20 text-white rounded-tr-none' : 'bg-[#1a1c23]/50 border border-white/5 text-gray-200 rounded-tl-none'">
                <div v-if="msg.role === 'assistant'" class="prose prose-invert prose-blue" v-html="renderMarkdown(msg.content)"></div>
                <div v-else class="whitespace-pre-wrap leading-relaxed">{{ msg.content }}</div>
              </div>
            </div>
          </div>
          
          <!-- Loading Indicator -->
          <div v-if="isLoading" class="flex gap-4 md:gap-6 animate-in fade-in duration-300">
            <div class="w-9 h-9 md:w-11 md:h-11 rounded-2xl bg-[#1a1c23] border border-white/10 flex items-center justify-center shrink-0">
              <Bot :size="22" class="text-blue-400" />
            </div>
            <div class="rounded-3xl rounded-tl-none px-8 py-5 bg-[#1a1c23]/50 border border-white/5 shadow-xl">
              <div class="flex gap-2">
                <span class="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]"></span>
                <span class="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]"></span>
                <span class="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Section -->
      <footer class="px-4 pb-8 pt-2 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/90 to-transparent flex-shrink-0 z-20">
        <div class="max-w-3xl mx-auto relative group">
          <div class="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-3xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
          <form @submit.prevent="sendMessage" class="relative">
            <textarea 
              ref="textarea"
              v-model="input" 
              rows="1"
              @input="adjustTextareaHeight"
              @keydown.enter.prevent="sendMessage"
              placeholder="Hỏi tôi về cấu hình, giá cả hoặc bảo hành điện thoại..."
              class="w-full bg-[#1a1c23] border border-white/10 rounded-3xl pl-6 pr-16 py-5 text-[15px] focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-600 resize-none min-h-[64px] max-h-[200px] leading-relaxed block shadow-2xl"
              :disabled="isLoading"
            ></textarea>
            <button 
              type="submit" 
              class="absolute right-3 bottom-3 w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale transition-all shadow-xl z-10"
              :disabled="!input.trim() || isLoading"
            >
              <Send v-if="!isLoading" :size="20" class="text-white" />
              <Loader2 v-else :size="20" class="text-white animate-spin" />
            </button>
          </form>
          <div class="flex items-center justify-between px-6 mt-3">
             <p class="text-[10px] text-gray-600 flex items-center gap-1.5 font-medium tracking-wide">
                <Sparkles :size="10" /> AI có thể trả lời sai. Hãy kiểm tra lại thông tin quan trọng.
             </p>
             <p class="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">
                Gemini-Flash • RAG System
             </p>
          </div>
        </div>
      </footer>
    </main>
  </div>
</template>

<style>
@import '~/assets/css/main.css';

.animate-bounce-slow {
  animation: bounce 3s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
  50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.prose pre {
  @apply shadow-2xl border border-white/10;
}
</style>
