<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-2xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Family Sharing</h1>

      <Card>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Family Members</h2>
        <div v-if="familyMembers.length > 0" class="space-y-4">
          <div v-for="member in familyMembers" :key="member.id" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span class="text-lg">{{ member.name.charAt(0).toUpperCase() }}</span>
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ member.name }}</p>
                <p class="text-sm text-gray-500">{{ member.email }} • {{ member.role }}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" @click="removeMember(member.id)">Remove</Button>
          </div>
        </div>
        <div v-else class="text-center py-8">
          <p class="text-gray-500 mb-4">No family members yet</p>
          <Button @click="showInviteForm = true">Invite Family Member</Button>
        </div>
      </Card>

      <Card v-if="showInviteForm" class="mt-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Invite Family Member</h2>
        <form @submit.prevent="onInvite" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input v-model="inviteForm.email" type="email" required placeholder="family@email.com" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <Select v-model="inviteForm.role" :options="roleOptions" />
          </div>
          <div class="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="secondary" @click="showInviteForm = false">Cancel</Button>
            <Button type="submit" :disabled="inviting">{{ inviting ? 'Inviting...' : 'Send Invitation' }}</Button>
          </div>
        </form>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Card from "../../components/ui/Card.vue";
import Input from "../../components/ui/Input.vue";
import Select from "../../components/ui/Select.vue";
import Button from "../../components/ui/Button.vue";

const showInviteForm = ref(false);
const inviting = ref(false);

const inviteForm = ref({
  email: "",
  role: "MEMBER",
});

const roleOptions = [
  { value: "ADMIN", label: "Admin" },
  { value: "MEMBER", label: "Member" },
  { value: "VIEWER", label: "Viewer" },
];

const familyMembers = ref([
  { id: "1", name: "John Doe", email: "john@example.com", role: "OWNER" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "ADMIN" },
]);

async function onInvite() {
  if (!inviteForm.value.email) {
    alert("Email is required");
    return;
  }
  inviting.value = true;
  // TODO: Implement invite API call
  alert("Invitation sent!");
  inviting.value = false;
  showInviteForm.value = false;
}
</script>