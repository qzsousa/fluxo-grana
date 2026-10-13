<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-2xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Family</h1>

      <div v-if="family">
        <UiCard>
          <div class="space-y-6">
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <span class="text-2xl font-bold text-primary-600">{{ family.name.charAt(0).toUpperCase() }}</span>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ family.name }}</h3>
                  <p class="text-sm text-gray-500">{{ family.members.length }} members</p>
                </div>
              </div>
              <router-link to="/family/invite" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                Invite Member
              </router-link>
            </div>

            <h3 class="text-lg font-semibold text-gray-900">Members</h3>
            <div v-if="family.members.length > 0" class="space-y-4">
              <div v-for="member in family.members" :key="member.id" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span class="text-lg font-semibold text-primary-600">{{ member.user.name.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ member.user.name }}</p>
                    <p class="text-sm text-gray-500">{{ member.user.email }} • {{ member.role }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <Select v-model="editingRole[member.id]" :options="roleOptions" @change="updateRole(member.id, $event)" />
                  <Button variant="danger" size="sm" @click="removeMember(member.id)">Remove</Button>
                </div>
              </div>
            </div>
          </div>
        </UiCard>
      </div>

      <div v-else>
        <UiCard class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a2.0027 2.0027 0 011.414-.586M19 20v-2c0-.656.126-1.283.356-1.857m-.001 0a2.0027 2.0027 0 01-1.414-.586m-12.001 0v-2c0-.656.126-1.283.356-1.857M15 20v-2c0-.656.126-1.283.356-1.857m-.001 0a2.0027 2.0027 0 01-1.414-.586"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No family</h3>
          <p class="mt-1 text-sm text-gray-500">Create a family to share finances with loved ones.</p>
          <div class="mt-6">
            <Button @click="createFamily">Create Family</Button>
          </div>
        </UiCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import UiCard from "../../components/ui/Card.vue";
import Button from "../../components/ui/Button.vue";
import Select from "../../components/ui/Select.vue";

const family = ref(null);
const editingRole = ref({});

const router = useRouter();

const familyData = ref({
  id: "1",
  name: "My Family",
  members: [
    { id: "1", user: { id: "1", name: "John Doe", email: "john@example.com" }, role: "OWNER", joinedAt: "2024-01-01" },
    { id: "2", user: { id: "2", name: "Jane Smith", email: "jane@example.com" }, role: "ADMIN", joinedAt: "2024-01-15" },
  ],
});

const roleOptions = [
  { value: "OWNER", label: "Owner" },
  { value: "ADMIN", label: "Admin" },
  { value: "MEMBER", label: "Member" },
  { value: "VIEWER", label: "Viewer" },
];

onMounted(() => {
  // TODO: Fetch family data from API
  // For now, use mock data
});

async function createFamily() {
  // TODO: Implement create family
  alert("Create family not yet implemented");
}

async function updateRole(memberId, role) {
  // TODO: Implement role update
  alert("Role updated to " + role);
}

async function removeMember(memberId) {
  if (!confirm("Remove this member from the family?")) return;
  alert("Member removed");
}
</script>