import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

const { width, height } = Dimensions.get('window');

// ── Bot Knowledge Base ──────────────────────────────────────────────────────
const SOIL_KNOWLEDGE = {
  'mất nước': 'Đất mất nước khi độ ẩm quá thấp. Hãy tưới nước đều đặn, sáng hoặc chiều. Kiểm tra độ ẩm bằng cách chạm vào đất - nếu khô, cần tưới ngay.',
  'tưới nước': 'Tưới nước đều đặn sáng hoặc chiều, tránh giữa trưa. Kiểm tra đất trước khi tưới. Tưới vừa đủ cho đất ẩm nhưng không chứa nước.',
  'phân bón': 'Sử dụng phân bón hữu cơ hoặc phân hóa học cân bằng. Tần suất: 2-4 tuần/lần. Đọc hướng dẫn trên bao và không bao giờ quá liều.',
  'côn trùng': 'Kiểm tra lá thường xuyên. Nếu có côn trùng, xịt nước muối nhẹ hoặc dùng thuốc trừ sâu hữu cơ. Cách ly cây nhiễm bệnh.',
  'pH đất': 'Độ pH lý tưởng cho hầu hết cây là 6.0-7.0. Nếu quá axit, thêm vôi. Nếu kiềm quá, thêm lưu huỳnh.',
  'cây vàng': 'Cây vàng do thiếu dinh dưỡng hoặc nước. Kiểm tra độ ẩm đất, thêm phân bón cân bằng, đảm bảo ánh sáng đủ.',
  'độ ẩm': 'Độ ẩm tối ưu: 40-60%. Quá cao dễ mốc, quá thấp cây héo. Kiểm tra với cảm biến hoặc bằng tay.',
  'đất chua': 'Đất chua (pH < 5.5) cản trở hấp thu dinh dưỡng. Hạ pH bằng cách thêm vôi nông nghiệp hoặc tro than.',
  'thoát nước': 'Đất phải thoát nước tốt để tránh ứ nước. Thêm cát hoặc xơ dừa để cải thiện độ xốp.',
  'nhiệt độ': 'Nhiệt độ tối ưu cho hầu hết cây: 20-28°C. Tránh nhiệt độ dưới 10°C và trên 35°C.',
  'sáng': 'Hầu hết cây cần 6-8 giờ sáng trực tiếp mỗi ngày. Tăng sáng nếu cây bị dè dẫm hoặc chậm lớn.',
  'chế độ chăm sóc': 'Kiểm tra độ ẩm 2-3 lần/tuần, tưới nước khi cần, bón phân 2-4 tuần/lần, cắt tỉa, kiểm tra dịch bệnh.',
};

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

const getRandomResponse = () => {
  const responses = [
    'Tôi hiểu rồi. Bạn cần thêm thông tin gì nữa không?',
    'Vâng, hãy nhớ rằng chăm sóc đất tốt là chìa khóa thành công. Còn câu hỏi nào khác không?',
    'Đúng vậy! Nếu bạn có vấn đề khác liên quan đến đất, tôi sẵn sàng giúp.',
    'Tôi hy vọng những lời khuyên này sẽ giúp bạn. Hỏi tôi nếu cần thêm chi tiết.',
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};

const findRelevantAnswer = (query: string): string | null => {
  const lowerQuery = query.toLowerCase();
  for (const [keyword, answer] of Object.entries(SOIL_KNOWLEDGE)) {
    if (lowerQuery.includes(keyword)) {
      return answer;
    }
  }
  return null;
};

export default function ChatbotModal() {
  const cardBackground = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: 'Xin chào! 👋 Tôi là trợ lý chăm sóc đất. Hỏi tôi bất cứ điều gì về đất, tưới nước, phân bón, hoặc chúc sóc cây trồng. Tôi sẵn sàng giúp bạn!',
      sender: 'bot',
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSendMessage = async () => {
    if (inputText.trim().length === 0) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simulate bot thinking time
    setTimeout(() => {
      // Find relevant answer from knowledge base
      const answer = findRelevantAnswer(inputText) || getRandomResponse();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: answer,
        sender: 'bot',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 800);
  };

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleClose = () => {
    router.dismiss();
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';

    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.botMessageContainer]}>
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.botBubble,
          ]}
        >
          <ThemedText
            style={[
              styles.messageText,
              isUser ? { color: '#FFFFFF' } : { color: '#000000' },
            ]}
          >
            {item.text}
          </ThemedText>
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#50C878' }]}>
        <ThemedText type="title" style={styles.headerTitle}>
           Trợ lý Đất
        </ThemedText>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          scrollEnabled={true}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input Area */}
        <View style={[styles.inputContainer, { backgroundColor: cardBackground }]}>
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="Hỏi về đất, tưới nước, phân bón..."
            placeholderTextColor={textColor}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={isLoading || inputText.trim().length === 0}
            style={[
              styles.sendButton,
              { opacity: isLoading || inputText.trim().length === 0 ? 0.5 : 1 },
            ]}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
    paddingLeft: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 8,
  },
  keyboardAvoidingView: {
    flex: 1,
    flexDirection: 'column',
  },
  messagesList: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  messageContainer: {
    marginVertical: 6,
    flexDirection: 'row',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#50C878',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#E8E8E8',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#50C878',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
