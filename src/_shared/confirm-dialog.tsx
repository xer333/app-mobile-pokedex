import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  children?: ReactNode;
};

export function ConfirmDialog({
  visible, title, message, confirmLabel, destructive = false,
  onCancel, onConfirm, children,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card} accessibilityViewIsModal>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          {children}
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={onCancel} style={styles.cancel}>
              <Text style={styles.cancelText}>Annuler</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              style={[styles.confirm, destructive && styles.destructive]}
            >
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.78)' },
  card: { gap: 14, padding: 20, borderRadius: 24, backgroundColor: '#202020', borderWidth: 1, borderColor: '#444' },
  title: { color: '#fff', fontSize: 20, fontWeight: '900' },
  message: { color: '#ddd', fontSize: 14, lineHeight: 21 },
  actions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  cancel: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 14, backgroundColor: '#333' },
  cancelText: { color: '#fff', fontWeight: '800' },
  confirm: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 14, backgroundColor: '#f8df94' },
  destructive: { backgroundColor: '#ffadad' },
  confirmText: { color: '#111', fontWeight: '900' },
});
