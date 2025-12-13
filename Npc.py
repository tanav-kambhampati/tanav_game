import pyautogui
import time
import random

# ============================================
# ULTRA MASSIVE ADVENTURE GAME - 100 HOUR VERSION
# 5000+ lines of complete game code
# Typing time: ~100 hours at ultra-slow speed
# ============================================

ULTRA_MASSIVE_GAME = []

# I'll add the original massive game first
ULTRA_MASSIVE_GAME.extend([
    """# ===================================================================
# EPIC ADVENTURE GAME - ULTRA COMPLETE EDITION
# A massive 2D adventure RPG with EVERYTHING
# ===================================================================

import pygame
import random
import json
import math
import pickle
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional, Set
from enum import Enum, auto
from collections import defaultdict, deque
import heapq

# === GAME CONSTANTS ===
SCREEN_WIDTH = 1920
SCREEN_HEIGHT = 1080
FPS = 60
TILE_SIZE = 32
CHUNK_SIZE = 16

# === COLOR PALETTE ===
class Colors:
    BLACK = (0, 0, 0)
    WHITE = (255, 255, 255)
    RED = (255, 0, 0)
    GREEN = (0, 255, 0)
    BLUE = (0, 0, 255)
    YELLOW = (255, 255, 0)
    CYAN = (0, 255, 255)
    MAGENTA = (255, 0, 255)
    GOLD = (255, 215, 0)
    SILVER = (192, 192, 192)
    BRONZE = (205, 127, 50)
    DARK_GRAY = (50, 50, 50)
    LIGHT_GRAY = (200, 200, 200)
    HEALTH_RED = (220, 20, 60)
    MANA_BLUE = (30, 144, 255)
    STAMINA_GREEN = (50, 205, 50)
    EXPERIENCE_PURPLE = (138, 43, 226)
    POISON_GREEN = (0, 128, 0)
    FIRE_ORANGE = (255, 69, 0)
    ICE_BLUE = (135, 206, 250)
    LIGHTNING_YELLOW = (255, 255, 100)
    SHADOW_PURPLE = (75, 0, 130)
    HOLY_GOLD = (255, 223, 0)

""",

    """# === ADVANCED MATH UTILITIES ===
class Vector2D:
    def __init__(self, x: float = 0, y: float = 0):
        self.x = x
        self.y = y

    def __add__(self, other):
        return Vector2D(self.x + other.x, self.y + other.y)

    def __sub__(self, other):
        return Vector2D(self.x - other.x, self.y - other.y)

    def __mul__(self, scalar: float):
        return Vector2D(self.x * scalar, self.y * scalar)

    def __truediv__(self, scalar: float):
        return Vector2D(self.x / scalar, self.y / scalar)

    def magnitude(self) -> float:
        return math.sqrt(self.x ** 2 + self.y ** 2)

    def normalize(self):
        mag = self.magnitude()
        if mag > 0:
            return self / mag
        return Vector2D(0, 0)

    def dot(self, other) -> float:
        return self.x * other.x + self.y * other.y

    def distance_to(self, other) -> float:
        return (self - other).magnitude()

    def rotate(self, angle: float):
        cos_a = math.cos(angle)
        sin_a = math.sin(angle)
        return Vector2D(
            self.x * cos_a - self.y * sin_a,
            self.x * sin_a + self.y * cos_a
        )

    def to_tuple(self) -> Tuple[float, float]:
        return (self.x, self.y)

class Rectangle:
    def __init__(self, x: float, y: float, width: float, height: float):
        self.x = x
        self.y = y
        self.width = width
        self.height = height

    def intersects(self, other) -> bool:
        return (self.x < other.x + other.width and
                self.x + self.width > other.x and
                self.y < other.y + other.height and
                self.y + self.height > other.y)

    def contains_point(self, x: float, y: float) -> bool:
        return (self.x <= x <= self.x + self.width and
                self.y <= y <= self.y + self.height)

    def center(self) -> Vector2D:
        return Vector2D(self.x + self.width / 2, self.y + self.height / 2)

""",

    """# === ENTITY COMPONENT SYSTEM ===
class Component:
    def __init__(self):
        self.owner = None

    def update(self, dt: float):
        pass

class TransformComponent(Component):
    def __init__(self, x: float = 0, y: float = 0, rotation: float = 0, scale: float = 1.0):
        super().__init__()
        self.position = Vector2D(x, y)
        self.rotation = rotation
        self.scale = scale
        self.velocity = Vector2D(0, 0)
        self.acceleration = Vector2D(0, 0)

    def update(self, dt: float):
        self.velocity = self.velocity + (self.acceleration * dt)
        self.position = self.position + (self.velocity * dt)
        self.acceleration = Vector2D(0, 0)

class SpriteComponent(Component):
    def __init__(self, sprite_name: str, width: int, height: int):
        super().__init__()
        self.sprite_name = sprite_name
        self.width = width
        self.height = height
        self.color = Colors.WHITE
        self.alpha = 255
        self.flip_x = False
        self.flip_y = False
        self.layer = 0

    def draw(self, screen, position: Vector2D, camera):
        screen_pos = camera.world_to_screen(position.x, position.y)
        rect = pygame.Rect(screen_pos[0], screen_pos[1], self.width, self.height)
        pygame.draw.rect(screen, self.color, rect)

class PhysicsComponent(Component):
    def __init__(self, mass: float = 1.0):
        super().__init__()
        self.mass = mass
        self.drag = 0.95
        self.gravity_scale = 1.0
        self.on_ground = False
        self.collision_layer = 0
        self.collision_mask = 0xFFFFFFFF

    def apply_force(self, force: Vector2D):
        if hasattr(self.owner, 'transform'):
            acceleration = force / self.mass
            self.owner.transform.acceleration = self.owner.transform.acceleration + acceleration

    def apply_impulse(self, impulse: Vector2D):
        if hasattr(self.owner, 'transform'):
            velocity_change = impulse / self.mass
            self.owner.transform.velocity = self.owner.transform.velocity + velocity_change

class Entity:
    def __init__(self, entity_id: int):
        self.id = entity_id
        self.active = True
        self.components: Dict[str, Component] = {}
        self.tags: Set[str] = set()

    def add_component(self, name: str, component: Component):
        component.owner = self
        self.components[name] = component
        setattr(self, name, component)

    def get_component(self, name: str) -> Optional[Component]:
        return self.components.get(name)

    def has_component(self, name: str) -> bool:
        return name in self.components

    def add_tag(self, tag: str):
        self.tags.add(tag)

    def has_tag(self, tag: str) -> bool:
        return tag in self.tags

    def update(self, dt: float):
        if self.active:
            for component in self.components.values():
                component.update(dt)

""",

    """# === ADVANCED PLAYER CLASS ===
class PlayerStats:
    def __init__(self):
        # Core stats
        self.level = 1
        self.experience = 0
        self.exp_to_level = 100
        self.skill_points = 0
        self.attribute_points = 0

        # Attributes (affect all other stats)
        self.strength = 10      # Affects melee damage, carry weight
        self.dexterity = 10     # Affects ranged damage, dodge, crit chance
        self.intelligence = 10  # Affects magic damage, mana pool
        self.vitality = 10      # Affects health, stamina
        self.wisdom = 10        # Affects mana regen, magic defense
        self.luck = 10          # Affects crit chance, loot quality

        # Combat stats
        self.max_health = 100
        self.health = 100
        self.max_mana = 50
        self.mana = 50
        self.max_stamina = 100
        self.stamina = 100

        # Regeneration
        self.health_regen = 0.5  # per second
        self.mana_regen = 1.0
        self.stamina_regen = 5.0

        # Damage stats
        self.physical_damage = 10
        self.magical_damage = 5
        self.critical_chance = 0.05
        self.critical_multiplier = 1.5

        # Defense stats
        self.armor = 0
        self.magic_resist = 0
        self.dodge_chance = 0.05
        self.block_chance = 0.0

        # Resistances (0.0 to 1.0, where 1.0 = immune)
        self.fire_resistance = 0.0
        self.ice_resistance = 0.0
        self.lightning_resistance = 0.0
        self.poison_resistance = 0.0
        self.shadow_resistance = 0.0
        self.holy_resistance = 0.0

        # Movement
        self.move_speed = 200
        self.jump_power = 400

        # Other
        self.carry_weight = 100
        self.gold = 0

    def calculate_derived_stats(self):
        # Update stats based on attributes
        self.max_health = 100 + (self.vitality * 10)
        self.max_mana = 50 + (self.intelligence * 5) + (self.wisdom * 3)
        self.max_stamina = 100 + (self.vitality * 5)

        self.physical_damage = 10 + (self.strength * 2) + (self.dexterity * 1)
        self.magical_damage = 5 + (self.intelligence * 3)

        self.critical_chance = 0.05 + (self.dexterity * 0.001) + (self.luck * 0.002)
        self.dodge_chance = 0.05 + (self.dexterity * 0.002)

        self.carry_weight = 100 + (self.strength * 5)

        self.mana_regen = 1.0 + (self.wisdom * 0.1)

    def gain_experience(self, amount: int):
        self.experience += amount
        while self.experience >= self.exp_to_level:
            self.level_up()

    def level_up(self):
        self.level += 1
        self.experience -= self.exp_to_level
        self.exp_to_level = int(self.exp_to_level * 1.5)
        self.skill_points += 3
        self.attribute_points += 5
        self.calculate_derived_stats()
        # Restore to full
        self.health = self.max_health
        self.mana = self.max_mana
        self.stamina = self.max_stamina

class Player:
    def __init__(self, x: float, y: float):
        self.entity_id = 0
        self.position = Vector2D(x, y)
        self.velocity = Vector2D(0, 0)
        self.size = Vector2D(32, 48)

        # Stats
        self.stats = PlayerStats()

        # State
        self.facing_right = True
        self.is_attacking = False
        self.is_blocking = False
        self.is_dodging = False
        self.is_casting = False
        self.is_dead = False
        self.is_interacting = False

        # Timers
        self.attack_cooldown = 0
        self.dodge_cooldown = 0
        self.interaction_cooldown = 0

        # Inventory and equipment
        self.inventory = Inventory(40)
        self.equipment = Equipment()
        self.skill_bar = SkillBar(10)

        # Buffs and debuffs
        self.status_effects: List[StatusEffect] = []

        # Combat
        self.target = None
        self.in_combat = False
        self.combat_timer = 0

    def update(self, dt: float):
        if self.is_dead:
            return

        # Update cooldowns
        if self.attack_cooldown > 0:
            self.attack_cooldown -= dt
        if self.dodge_cooldown > 0:
            self.dodge_cooldown -= dt
        if self.interaction_cooldown > 0:
            self.interaction_cooldown -= dt

        # Regeneration
        if self.stats.health < self.stats.max_health:
            self.stats.health = min(self.stats.max_health,
                                  self.stats.health + self.stats.health_regen * dt)

        if self.stats.mana < self.stats.max_mana:
            self.stats.mana = min(self.stats.max_mana,
                                self.stats.mana + self.stats.mana_regen * dt)

        if self.stats.stamina < self.stats.max_stamina:
            self.stats.stamina = min(self.stats.max_stamina,
                                   self.stats.stamina + self.stats.stamina_regen * dt)

        # Update status effects
        self.update_status_effects(dt)

        # Update position
        self.position = self.position + (self.velocity * dt)

        # Combat timer
        if self.in_combat:
            self.combat_timer += dt
            if self.combat_timer > 10:  # 10 seconds out of combat
                self.exit_combat()

    def update_status_effects(self, dt: float):
        for effect in self.status_effects[:]:
            effect.update(dt)
            if effect.is_expired():
                effect.remove(self)
                self.status_effects.remove(effect)

    def take_damage(self, amount: int, damage_type: str = 'physical') -> int:
        # Calculate actual damage
        damage = amount

        if damage_type == 'physical':
            damage = max(1, damage - self.stats.armor)
        elif damage_type == 'magical':
            damage = max(1, damage - self.stats.magic_resist)

        # Apply elemental resistances
        resistance_map = {
            'fire': self.stats.fire_resistance,
            'ice': self.stats.ice_resistance,
            'lightning': self.stats.lightning_resistance,
            'poison': self.stats.poison_resistance,
            'shadow': self.stats.shadow_resistance,
            'holy': self.stats.holy_resistance
        }

        if damage_type in resistance_map:
            damage = int(damage * (1.0 - resistance_map[damage_type]))

        # Try to dodge
        if random.random() < self.stats.dodge_chance:
            return 0  # Dodged!

        # Try to block
        if self.is_blocking and random.random() < self.stats.block_chance:
            damage = damage // 2

        # Apply damage
        self.stats.health = max(0, self.stats.health - damage)

        if self.stats.health == 0:
            self.on_death()

        self.enter_combat()
        return damage

    def heal(self, amount: int):
        self.stats.health = min(self.stats.max_health, self.stats.health + amount)

    def restore_mana(self, amount: int):
        self.stats.mana = min(self.stats.max_mana, self.stats.mana + amount)

    def restore_stamina(self, amount: int):
        self.stats.stamina = min(self.stats.max_stamina, self.stats.stamina + amount)

    def enter_combat(self):
        self.in_combat = True
        self.combat_timer = 0

    def exit_combat(self):
        self.in_combat = False
        self.target = None

    def on_death(self):
        self.is_dead = True
        # Drop some items, return to checkpoint, etc.

    def respawn(self, position: Vector2D):
        self.is_dead = False
        self.position = position
        self.stats.health = self.stats.max_health
        self.stats.mana = self.stats.max_mana
        self.stats.stamina = self.stats.max_stamina

""",

    """# === INVENTORY SYSTEM ===
class ItemRarity(Enum):
    COMMON = (Colors.WHITE, 1.0)
    UNCOMMON = (Colors.GREEN, 0.3)
    RARE = (Colors.BLUE, 0.1)
    EPIC = (Colors.MAGENTA, 0.03)
    LEGENDARY = (Colors.GOLD, 0.01)
    MYTHIC = (Colors.RED, 0.001)

    def __init__(self, color, drop_chance):
        self.color = color
        self.drop_chance = drop_chance

class ItemType(Enum):
    WEAPON = auto()
    ARMOR = auto()
    ACCESSORY = auto()
    CONSUMABLE = auto()
    MATERIAL = auto()
    QUEST = auto()
    CURRENCY = auto()

class Item:
    def __init__(self, name: str, item_type: ItemType, description: str, value: int):
        self.name = name
        self.type = item_type
        self.description = description
        self.value = value
        self.rarity = ItemRarity.COMMON
        self.stackable = False
        self.quantity = 1
        self.weight = 1.0
        self.level_requirement = 1
        self.sell_price = value
        self.buy_price = value * 2

    def use(self, player):
        pass

class Weapon(Item):
    def __init__(self, name: str, damage: int, attack_speed: float, weapon_type: str):
        super().__init__(name, ItemType.WEAPON, f'A {weapon_type} that deals {damage} damage', damage * 10)
        self.damage = damage
        self.attack_speed = attack_speed
        self.weapon_type = weapon_type  # sword, axe, bow, staff, etc.
        self.durability = 100
        self.max_durability = 100
        self.enchantments = []
        self.sockets = []
        self.damage_type = 'physical'  # physical, magical, fire, ice, etc.

    def get_total_damage(self) -> int:
        damage = self.damage
        for enchant in self.enchantments:
            damage += enchant.damage_bonus
        return damage

class Armor(Item):
    def __init__(self, name: str, defense: int, armor_slot: str):
        super().__init__(name, ItemType.ARMOR, f'Armor that provides {defense} defense', defense * 15)
        self.defense = defense
        self.armor_slot = armor_slot  # helmet, chest, legs, boots, gloves
        self.durability = 100
        self.max_durability = 100
        self.enchantments = []
        self.set_bonus = None

class Accessory(Item):
    def __init__(self, name: str, accessory_type: str):
        super().__init__(name, ItemType.ACCESSORY, 'A magical accessory', 100)
        self.accessory_type = accessory_type  # ring, amulet, trinket
        self.stat_bonuses = {}  # {stat_name: bonus_value}

class Consumable(Item):
    def __init__(self, name: str, effect_type: str, effect_value: int):
        super().__init__(name, ItemType.CONSUMABLE, f'Restores {effect_value} {effect_type}', effect_value * 5)
        self.effect_type = effect_type
        self.effect_value = effect_value
        self.stackable = True
        self.cooldown = 0  # Potion cooldown

    def use(self, player):
        if self.effect_type == 'health':
            player.heal(self.effect_value)
        elif self.effect_type == 'mana':
            player.restore_mana(self.effect_value)
        elif self.effect_type == 'stamina':
            player.restore_stamina(self.effect_value)
        return True

class Inventory:
    def __init__(self, max_slots: int):
        self.max_slots = max_slots
        self.items: List[Item] = []
        self.gold = 0

    def add_item(self, item: Item) -> bool:
        # Check if stackable item already exists
        if item.stackable:
            for inv_item in self.items:
                if inv_item.name == item.name:
                    inv_item.quantity += item.quantity
                    return True

        # Add new item if space available
        if len(self.items) < self.max_slots:
            self.items.append(item)
            return True
        return False

    def remove_item(self, item: Item, quantity: int = 1) -> bool:
        if item in self.items:
            if item.stackable:
                item.quantity -= quantity
                if item.quantity <= 0:
                    self.items.remove(item)
            else:
                self.items.remove(item)
            return True
        return False

    def get_items_by_type(self, item_type: ItemType) -> List[Item]:
        return [item for item in self.items if item.type == item_type]

    def get_total_weight(self) -> float:
        return sum(item.weight * item.quantity for item in self.items)

    def sort_by_rarity(self):
        self.items.sort(key=lambda x: list(ItemRarity).index(x.rarity), reverse=True)

    def sort_by_value(self):
        self.items.sort(key=lambda x: x.value, reverse=True)

class Equipment:
    def __init__(self):
        self.weapon = None
        self.helmet = None
        self.chest = None
        self.legs = None
        self.boots = None
        self.gloves = None
        self.ring1 = None
        self.ring2 = None
        self.amulet = None
        self.trinket = None

    def equip(self, item: Item, player) -> Optional[Item]:
        old_item = None

        if isinstance(item, Weapon):
            old_item = self.weapon
            self.weapon = item
        elif isinstance(item, Armor):
            slot_map = {
                'helmet': 'helmet',
                'chest': 'chest',
                'legs': 'legs',
                'boots': 'boots',
                'gloves': 'gloves'
            }
            slot = slot_map.get(item.armor_slot)
            if slot:
                old_item = getattr(self, slot)
                setattr(self, slot, item)

        # Update player stats
        self.update_player_stats(player)
        return old_item

    def unequip(self, slot: str, player) -> Optional[Item]:
        item = getattr(self, slot, None)
        if item:
            setattr(self, slot, None)
            self.update_player_stats(player)
        return item

    def update_player_stats(self, player):
        # Recalculate all stats from equipment
        total_armor = 0
        total_damage = 0

        if self.weapon:
            total_damage += self.weapon.get_total_damage()

        for slot in ['helmet', 'chest', 'legs', 'boots', 'gloves']:
            armor_piece = getattr(self, slot)
            if armor_piece:
                total_armor += armor_piece.defense

        player.stats.armor = total_armor
        player.stats.physical_damage = player.stats.physical_damage + total_damage

    def get_all_items(self) -> List[Item]:
        items = []
        for slot in ['weapon', 'helmet', 'chest', 'legs', 'boots', 'gloves',
                     'ring1', 'ring2', 'amulet', 'trinket']:
            item = getattr(self, slot)
            if item:
                items.append(item)
        return items

""",

    """# === SKILL AND ABILITY SYSTEM ===
class SkillType(Enum):
    ACTIVE = auto()   # Must be manually activated
    PASSIVE = auto()  # Always active
    TOGGLE = auto()   # Can be turned on/off

class DamageElement(Enum):
    PHYSICAL = auto()
    FIRE = auto()
    ICE = auto()
    LIGHTNING = auto()
    POISON = auto()
    SHADOW = auto()
    HOLY = auto()

class Skill:
    def __init__(self, name: str, description: str, skill_type: SkillType):
        self.name = name
        self.description = description
        self.skill_type = skill_type
        self.level = 1
        self.max_level = 10
        self.unlocked = False

        # Costs
        self.mana_cost = 0
        self.stamina_cost = 0
        self.health_cost = 0

        # Cooldown
        self.cooldown = 0
        self.current_cooldown = 0

        # Requirements
        self.level_requirement = 1
        self.skill_requirements = []  # Other skills needed

    def can_use(self, player) -> bool:
        if self.current_cooldown > 0:
            return False
        if player.stats.mana < self.mana_cost:
            return False
        if player.stats.stamina < self.stamina_cost:
            return False
        return True

    def use(self, player, target=None):
        if not self.can_use(player):
            return False

        # Consume resources
        player.stats.mana -= self.mana_cost
        player.stats.stamina -= self.stamina_cost
        player.stats.health -= self.health_cost

        # Start cooldown
        self.current_cooldown = self.cooldown

        # Execute skill effect
        self.execute(player, target)
        return True

    def execute(self, player, target):
        # Override in subclasses
        pass

    def update(self, dt: float):
        if self.current_cooldown > 0:
            self.current_cooldown = max(0, self.current_cooldown - dt)

class AttackSkill(Skill):
    def __init__(self, name: str, damage: int, element: DamageElement):
        super().__init__(name, f'Deals {damage} {element.name} damage', SkillType.ACTIVE)
        self.damage = damage
        self.element = element
        self.aoe_radius = 0  # 0 = single target
        self.projectile = False

    def execute(self, player, target):
        if target:
            damage = self.damage + (self.level * 5)
            target.take_damage(damage, self.element.name.lower())

class BuffSkill(Skill):
    def __init__(self, name: str, stat_name: str, bonus_value: int, duration: float):
        super().__init__(name, f'Increases {stat_name} by {bonus_value}', SkillType.ACTIVE)
        self.stat_name = stat_name
        self.bonus_value = bonus_value
        self.duration = duration

    def execute(self, player, target=None):
        buff = StatBuff(self.stat_name, self.bonus_value, self.duration)
        player.status_effects.append(buff)

class HealSkill(Skill):
    def __init__(self, name: str, heal_amount: int):
        super().__init__(name, f'Restores {heal_amount} health', SkillType.ACTIVE)
        self.heal_amount = heal_amount

    def execute(self, player, target=None):
        heal = self.heal_amount + (self.level * 10)
        if target:
            target.heal(heal)
        else:
            player.heal(heal)

class PassiveSkill(Skill):
    def __init__(self, name: str, stat_name: str, bonus_percent: float):
        super().__init__(name, f'Increases {stat_name} by {bonus_percent}%', SkillType.PASSIVE)
        self.stat_name = stat_name
        self.bonus_percent = bonus_percent

    def apply_passive(self, player):
        # Apply permanent stat boost
        current_value = getattr(player.stats, self.stat_name, 0)
        bonus = current_value * (self.bonus_percent / 100)
        setattr(player.stats, self.stat_name, current_value + bonus)

class SkillBar:
    def __init__(self, max_slots: int):
        self.max_slots = max_slots
        self.skills: List[Optional[Skill]] = [None] * max_slots

    def add_skill(self, skill: Skill, slot: int) -> bool:
        if 0 <= slot < self.max_slots:
            self.skills[slot] = skill
            return True
        return False

    def remove_skill(self, slot: int):
        if 0 <= slot < self.max_slots:
            self.skills[slot] = None

    def use_skill(self, slot: int, player, target=None) -> bool:
        if 0 <= slot < self.max_slots and self.skills[slot]:
            return self.skills[slot].use(player, target)
        return False

    def update(self, dt: float):
        for skill in self.skills:
            if skill:
                skill.update(dt)

class SkillTree:
    def __init__(self, name: str):
        self.name = name
        self.skills: Dict[str, Skill] = {}
        self.unlocked_skills: Set[str] = set()

    def add_skill(self, skill: Skill):
        self.skills[skill.name] = skill

    def unlock_skill(self, skill_name: str, player) -> bool:
        if skill_name not in self.skills:
            return False

        skill = self.skills[skill_name]

        # Check requirements
        if player.stats.level < skill.level_requirement:
            return False

        # Check if prerequisite skills are unlocked
        for req_skill in skill.skill_requirements:
            if req_skill not in self.unlocked_skills:
                return False

        # Check if player has skill points
        if player.stats.skill_points < 1:
            return False

        # Unlock skill
        skill.unlocked = True
        self.unlocked_skills.add(skill_name)
        player.stats.skill_points -= 1

        # Apply passive if applicable
        if skill.skill_type == SkillType.PASSIVE:
            skill.apply_passive(player)

        return True

""",

    """# === STATUS EFFECT SYSTEM ===
class StatusEffect:
    def __init__(self, name: str, duration: float, is_buff: bool = True):
        self.name = name
        self.duration = duration
        self.max_duration = duration
        self.is_buff = is_buff
        self.time_elapsed = 0
        self.stacks = 1
        self.max_stacks = 1

    def update(self, dt: float):
        self.time_elapsed += dt

    def is_expired(self) -> bool:
        return self.time_elapsed >= self.duration

    def apply(self, entity):
        # Override in subclasses
        pass

    def remove(self, entity):
        # Override in subclasses
        pass

    def get_remaining_time(self) -> float:
        return max(0, self.duration - self.time_elapsed)

class StatBuff(StatusEffect):
    def __init__(self, stat_name: str, bonus: int, duration: float):
        super().__init__(f'{stat_name}_buff', duration, True)
        self.stat_name = stat_name
        self.bonus = bonus
        self.applied = False

    def apply(self, entity):
        if not self.applied and hasattr(entity, 'stats'):
            current = getattr(entity.stats, self.stat_name, 0)
            setattr(entity.stats, self.stat_name, current + self.bonus)
            self.applied = True

    def remove(self, entity):
        if self.applied and hasattr(entity, 'stats'):
            current = getattr(entity.stats, self.stat_name, 0)
            setattr(entity.stats, self.stat_name, current - self.bonus)

class DamageOverTime(StatusEffect):
    def __init__(self, damage_per_tick: int, tick_rate: float, duration: float, damage_type: str):
        super().__init__(f'{damage_type}_dot', duration, False)
        self.damage_per_tick = damage_per_tick
        self.tick_rate = tick_rate
        self.damage_type = damage_type
        self.time_since_tick = 0

    def update(self, dt: float):
        super().update(dt)
        self.time_since_tick += dt

        if self.time_since_tick >= self.tick_rate:
            self.tick()
            self.time_since_tick = 0

    def tick(self):
        # This will be called from the entity update
        pass

class Stun(StatusEffect):
    def __init__(self, duration: float):
        super().__init__('stun', duration, False)

    def apply(self, entity):
        entity.is_stunned = True

    def remove(self, entity):
        entity.is_stunned = False

class Slow(StatusEffect):
    def __init__(self, slow_percent: float, duration: float):
        super().__init__('slow', duration, False)
        self.slow_percent = slow_percent
        self.applied = False

    def apply(self, entity):
        if not self.applied and hasattr(entity, 'stats'):
            entity.stats.move_speed *= (1 - self.slow_percent)
            self.applied = True

    def remove(self, entity):
        if self.applied and hasattr(entity, 'stats'):
            entity.stats.move_speed /= (1 - self.slow_percent)

class Root(StatusEffect):
    def __init__(self, duration: float):
        super().__init__('root', duration, False)

    def apply(self, entity):
        entity.is_rooted = True
        entity.velocity = Vector2D(0, 0)

    def remove(self, entity):
        entity.is_rooted = False

class Poison(DamageOverTime):
    def __init__(self, damage_per_tick: int, duration: float):
        super().__init__(damage_per_tick, 1.0, duration, 'poison')
        self.max_stacks = 5

class Burn(DamageOverTime):
    def __init__(self, damage_per_tick: int, duration: float):
        super().__init__(damage_per_tick, 0.5, duration, 'fire')

class Freeze(StatusEffect):
    def __init__(self, duration: float):
        super().__init__('freeze', duration, False)

    def apply(self, entity):
        entity.is_frozen = True
        entity.velocity = Vector2D(0, 0)

    def remove(self, entity):
        entity.is_frozen = False

""",
])

# NOW ADDING TRULY MASSIVE CONTENT - 200+ MORE SECTIONS!

# Enemy types with full implementations
for enemy_num in range(100):
    ULTRA_MASSIVE_GAME.append(f"""
# === ENEMY TYPE #{enemy_num+1} ===
class Enemy{enemy_num}:
    def __init__(self, x: float, y: float):
        self.name = "Enemy_{enemy_num}"
        self.position = Vector2D(x, y)
        self.health = {50 + enemy_num * 10}
        self.max_health = {50 + enemy_num * 10}
        self.damage = {5 + enemy_num * 2}
        self.speed = {50 + enemy_num}
        self.exp_reward = {10 + enemy_num * 5}
        self.gold_reward = {5 + enemy_num * 3}
        self.level = {1 + enemy_num // 5}
        self.aggressive = {str(enemy_num % 2 == 0)}
        self.flying = {str(enemy_num % 3 == 0)}
        self.boss = {str(enemy_num % 10 == 0)}

    def update(self, dt: float, player):
        # AI behavior
        distance = self.position.distance_to(player.position)
        if distance < 200 and self.aggressive:
            direction = (player.position - self.position).normalize()
            self.position = self.position + (direction * self.speed * dt)

    def attack(self, target):
        return random.randint(self.damage - 2, self.damage + 2)

    def take_damage(self, amount: int):
        self.health = max(0, self.health - amount)
        return self.health <= 0

    def get_loot(self):
        loot = []
        if random.random() < 0.3:
            loot.append(Item('Potion', ItemType.CONSUMABLE, 'Healing', 10))
        if random.random() < 0.1:
            loot.append(Item('Rare_Item_{enemy_num}', ItemType.MATERIAL, 'Crafting', 50))
        return loot

""")

# Add 100 different items
for item_num in range(100):
    ULTRA_MASSIVE_GAME.append(f"""
# === ITEM #{item_num+1} ===
class GameItem{item_num}(Item):
    def __init__(self):
        super().__init__(
            'Item_{item_num}',
            ItemType.{'WEAPON' if item_num % 4 == 0 else 'ARMOR' if item_num % 4 == 1 else 'CONSUMABLE' if item_num % 4 == 2 else 'MATERIAL'},
            'A legendary item from the ancient times',
            {10 + item_num * 5}
        )
        self.rarity = ItemRarity.{'LEGENDARY' if item_num % 20 == 0 else 'EPIC' if item_num % 10 == 0 else 'RARE' if item_num % 5 == 0 else 'UNCOMMON' if item_num % 2 == 0 else 'COMMON'}
        self.level_requirement = {1 + item_num // 3}
        self.stats = {{
            'strength': {item_num % 20},
            'dexterity': {item_num % 15},
            'intelligence': {item_num % 18},
            'vitality': {item_num % 25}
        }}
        self.enchantments = []
        self.socket_count = {item_num % 4}
        self.can_trade = {str(item_num % 3 != 0)}
        self.unique = {str(item_num % 50 == 0)}

    def use(self, player):
        if self.type == ItemType.CONSUMABLE:
            player.heal({20 + item_num * 2})
            return True
        return False

    def get_tooltip(self):
        lines = []
        lines.append(f'{{self.name}} (Level {{self.level_requirement}})')
        lines.append(f'Rarity: {{self.rarity.name}}')
        lines.append(f'Value: {{self.value}} gold')
        for stat, value in self.stats.items():
            if value > 0:
                lines.append(f'  +{{value}} {{stat}}')
        return '\\n'.join(lines)

""")

# Add 50 quests
for quest_num in range(50):
    ULTRA_MASSIVE_GAME.append(f"""
# === QUEST #{quest_num+1} ===
class Quest{quest_num}:
    def __init__(self):
        self.id = 'quest_{quest_num}'
        self.name = 'Epic Quest {quest_num}'
        self.description = 'A {'dangerous' if quest_num % 2 == 0 else 'mysterious'} quest awaits...'
        self.level_requirement = {1 + quest_num}
        self.rewards = {{
            'exp': {100 + quest_num * 50},
            'gold': {50 + quest_num * 25},
            'items': []
        }}
        self.objectives = [
            {{'type': 'kill', 'target': 'Enemy{quest_num % 20}', 'amount': {3 + quest_num % 10}}},
            {{'type': 'collect', 'target': 'Item_{quest_num % 30}', 'amount': {2 + quest_num % 5}}},
            {{'type': 'explore', 'target': 'Location_{quest_num % 15}', 'amount': 1}}
        ]
        self.chain_quest = {'quest_{quest_num + 1}' if quest_num < 49 else 'None'}
        self.repeatable = {str(quest_num % 5 == 0)}
        self.daily = {str(quest_num % 7 == 0)}
        self.completed = False

    def check_completion(self, player_data):
        for obj in self.objectives:
            progress = player_data.get(obj['type'], {{}}).get(obj['target'], 0)
            if progress < obj['amount']:
                return False
        return True

    def grant_rewards(self, player):
        player.gain_experience(self.rewards['exp'])
        player.stats.gold += self.rewards['gold']
        for item in self.rewards['items']:
            player.inventory.add_item(item)
        self.completed = True

""")

# Add 30 NPC types
for npc_num in range(30):
    ULTRA_MASSIVE_GAME.append(f"""
# === NPC #{npc_num+1} ===
class NPC{npc_num}:
    def __init__(self, x: float, y: float):
        self.name = '{'Merchant' if npc_num % 5 == 0 else 'Guard' if npc_num % 5 == 1 else 'Wizard' if npc_num % 5 == 2 else 'Farmer' if npc_num % 5 == 3 else 'Blacksmith'}_{{npc_num}}'
        self.position = Vector2D(x, y)
        self.dialogue_tree = self.create_dialogue()
        self.shop_inventory = self.create_shop() if {str(npc_num % 5 == 0)} else []
        self.quests = ['quest_{npc_num}'] if {str(npc_num % 3 == 0)} else []
        self.faction = '{'Alliance' if npc_num % 2 == 0 else 'Horde'}'
        self.reputation_required = {npc_num * 100}
        self.friendly = {str(npc_num % 4 != 0)}

    def create_dialogue(self):
        return {{
            'greeting': f'Hello traveler! I am {{self.name}}.',
            'quest': 'I have a task for you...' if self.quests else 'I have nothing for you.',
            'shop': 'Browse my wares!' if self.shop_inventory else 'I have nothing to sell.',
            'goodbye': 'Safe travels!'
        }}

    def create_shop(self):
        items = []
        for i in range({5 + npc_num % 10}):
            items.append(GameItem{{(npc_num + i) % 100}}())
        return items

    def interact(self, player):
        if not self.friendly and player.faction != self.faction:
            return 'This NPC is hostile!'
        return self.dialogue_tree['greeting']

    def sell_item(self, item, player):
        if item in self.shop_inventory:
            if player.stats.gold >= item.buy_price:
                player.stats.gold -= item.buy_price
                player.inventory.add_item(item)
                return True
        return False

    def buy_item(self, item, player):
        if item in player.inventory.items:
            player.stats.gold += item.sell_price
            player.inventory.remove_item(item)
            return True
        return False

""")

# Add 20 dungeon types
for dungeon_num in range(20):
    ULTRA_MASSIVE_GAME.append(f"""
# === DUNGEON #{dungeon_num+1} ===
class Dungeon{dungeon_num}:
    def __init__(self):
        self.name = 'Dungeon of {['Doom', 'Shadows', 'Fire', 'Ice', 'Lightning'][dungeon_num % 5]}'
        self.level_requirement = {5 + dungeon_num * 3}
        self.max_players = {1 + dungeon_num % 5}
        self.width = {30 + dungeon_num * 5}
        self.height = {30 + dungeon_num * 5}
        self.room_count = {5 + dungeon_num}
        self.difficulty = {['Easy', 'Normal', 'Hard', 'Expert', 'Nightmare'][dungeon_num % 5]}
        self.boss = Enemy{{dungeon_num % 20}}(0, 0)
        self.treasures = {3 + dungeon_num % 7}
        self.traps = {2 + dungeon_num % 5}
        self.puzzles = {1 + dungeon_num % 4}

    def generate(self):
        tiles = [[0 for _ in range(self.width)] for _ in range(self.height)]
        rooms = []

        for room_num in range(self.room_count):
            w = random.randint(5, 12)
            h = random.randint(5, 12)
            x = random.randint(1, self.width - w - 1)
            y = random.randint(1, self.height - h - 1)

            room = {{'x': x, 'y': y, 'w': w, 'h': h}}
            rooms.append(room)

            for row in range(y, y + h):
                for col in range(x, x + w):
                    tiles[row][col] = 1

        return tiles, rooms

    def spawn_enemies(self):
        enemies = []
        for i in range({5 + dungeon_num * 2}):
            enemy_type = random.randint(0, 99)
            x = random.randint(0, self.width * 32)
            y = random.randint(0, self.height * 32)
            enemies.append(eval(f'Enemy{{enemy_type}}')(x, y))
        return enemies

    def place_treasures(self, rooms):
        treasures = []
        for i in range(self.treasures):
            room = random.choice(rooms)
            x = (room['x'] + room['w'] // 2) * 32
            y = (room['y'] + room['h'] // 2) * 32
            treasures.append({{
                'position': Vector2D(x, y),
                'items': [GameItem{{random.randint(0, 99)}}() for _ in range(random.randint(1, 5))]
            }})
        return treasures

""")

# Add 20 spell types
for spell_num in range(20):
    element_list = ['FIRE', 'ICE', 'LIGHTNING', 'POISON', 'HOLY']
    element = element_list[spell_num % 5]
    effect_map = {'fire': 'Burn', 'ice': 'Freeze', 'lightning': 'Stun', 'poison': 'Poison', 'holy': 'Heal'}
    status_effect = effect_map[element.lower()]

    ULTRA_MASSIVE_GAME.append(f"""
# === SPELL #{spell_num+1} ===
class Spell{spell_num}(AttackSkill):
    def __init__(self):
        element = '{element}'
        super().__init__(
            'Spell_{spell_num}_{element}',
            {20 + spell_num * 10},
            DamageElement.{element}
        )
        self.mana_cost = {10 + spell_num * 2}
        self.cooldown = {2.0 + spell_num * 0.5}
        self.cast_time = {1.0 + spell_num * 0.2}
        self.aoe_radius = {0 if spell_num % 3 == 0 else 50 + spell_num * 10}
        self.projectile_speed = {300 + spell_num * 20}
        self.status_effect = '{status_effect}'
        self.level_requirement = {1 + spell_num}

    def cast(self, caster, target):
        if caster.stats.mana >= self.mana_cost:
            damage = self.damage + (caster.stats.intelligence * 0.5)
            target.take_damage(int(damage), self.element.name.lower())

            # Apply status effect
            if self.status_effect and random.random() < 0.3:
                if self.status_effect == 'Burn':
                    target.status_effects.append(Burn(5, 3.0))
                elif self.status_effect == 'Freeze':
                    target.status_effects.append(Freeze(2.0))
                elif self.status_effect == 'Stun':
                    target.status_effects.append(Stun(1.5))
                elif self.status_effect == 'Poison':
                    target.status_effects.append(Poison(3, 5.0))

            caster.stats.mana -= self.mana_cost
            return True
        return False

""")

# Add 15 crafting recipes
for recipe_num in range(15):
    profession_list = ['Blacksmithing', 'Alchemy', 'Enchanting']
    profession = profession_list[recipe_num % 3]
    mat1 = recipe_num % 20
    mat2 = (recipe_num + 1) % 20
    amt1 = 2 + recipe_num % 5
    amt2 = 1 + recipe_num % 3

    ULTRA_MASSIVE_GAME.append(f"""
# === CRAFTING RECIPE #{recipe_num+1} ===
class CraftingRecipe{recipe_num}:
    def __init__(self):
        self.name = 'Recipe_{recipe_num}'
        self.profession = '{profession}'
        self.skill_required = {recipe_num * 10}
        self.ingredients = [
            {{'item': 'Material_{mat1}', 'amount': {amt1}}},
            {{'item': 'Material_{mat2}', 'amount': {amt2}}},
        ]
        self.result = GameItem{recipe_num % 100}()
        self.result_quantity = {1 + recipe_num % 3}
        self.craft_time = {5.0 + recipe_num * 2.0}
        self.exp_gained = {10 + recipe_num * 5}

    def can_craft(self, player):
        profession_skill = player.professions.get(self.profession, 0)
        if profession_skill < self.skill_required:
            return False

        for ingredient in self.ingredients:
            count = sum(item.quantity for item in player.inventory.items
                       if item.name == ingredient['item'])
            if count < ingredient['amount']:
                return False
        return True

    def craft(self, player):
        if not self.can_craft(player):
            return False

        # Remove ingredients
        for ingredient in self.ingredients:
            remaining = ingredient['amount']
            for item in player.inventory.items[:]:
                if item.name == ingredient['item'] and remaining > 0:
                    take = min(item.quantity, remaining)
                    item.quantity -= take
                    remaining -= take
                    if item.quantity <= 0:
                        player.inventory.items.remove(item)

        # Add result
        for _ in range(self.result_quantity):
            player.inventory.add_item(self.result)

        # Gain profession exp
        player.gain_profession_exp(self.profession, self.exp_gained)
        return True

""")

# Add 15 achievements
for achievement_num in range(15):
    if achievement_num % 3 == 0:
        desc = 'Defeat 100 enemies'
        category = 'Combat'
        req = 100
    elif achievement_num % 3 == 1:
        desc = 'Reach level 50'
        category = 'Exploration'
        req = 50
    else:
        desc = 'Collect 1000 items'
        category = 'Collection'
        req = 1000

    hidden = str(achievement_num % 5 == 0)
    has_item = str(achievement_num % 2 == 0)

    ULTRA_MASSIVE_GAME.append(f"""
# === ACHIEVEMENT #{achievement_num+1} ===
class Achievement{achievement_num}:
    def __init__(self):
        self.name = 'Achievement_{achievement_num}'
        self.description = '{desc}'
        self.category = '{category}'
        self.points = {10 + achievement_num * 5}
        self.unlocked = False
        self.progress = 0
        self.requirement = {req}
        self.hidden = {hidden}
        self.rewards = {{
            'title': 'Achievement_{achievement_num}_Title',
            'item': GameItem{achievement_num % 100}() if {has_item} else None,
            'gold': {100 + achievement_num * 50}
        }}

    def check_progress(self, player_stats):
        if self.category == 'Combat':
            self.progress = player_stats.get('enemies_killed', 0)
        elif self.category == 'Exploration':
            self.progress = player_stats.get('level', 0)
        elif self.category == 'Collection':
            self.progress = player_stats.get('items_collected', 0)

        if self.progress >= self.requirement and not self.unlocked:
            self.unlock()
            return True
        return False

    def unlock(self):
        self.unlocked = True
        print(f'Achievement Unlocked: {{self.name}}!')
        print(f'+{{self.points}} achievement points')

""")

# Add Weather System
ULTRA_MASSIVE_GAME.append("""
# === WEATHER SYSTEM ===
class WeatherType(Enum):
    CLEAR = auto()
    RAIN = auto()
    SNOW = auto()
    FOG = auto()
    STORM = auto()

class WeatherSystem:
    def __init__(self):
        self.current_weather = WeatherType.CLEAR
        self.weather_duration = 300  # 5 minutes
        self.time_in_weather = 0
        self.transition_time = 10
        self.transitioning = False

    def update(self, dt: float):
        self.time_in_weather += dt

        if self.time_in_weather >= self.weather_duration and not self.transitioning:
            self.change_weather()

    def change_weather(self):
        weights = {
            WeatherType.CLEAR: 0.4,
            WeatherType.RAIN: 0.3,
            WeatherType.SNOW: 0.1,
            WeatherType.FOG: 0.15,
            WeatherType.STORM: 0.05
        }
        self.current_weather = random.choices(list(weights.keys()), weights=list(weights.values()))[0]
        self.time_in_weather = 0
        self.weather_duration = random.randint(180, 600)

    def get_gameplay_effects(self):
        effects = {}
        if self.current_weather == WeatherType.RAIN:
            effects['visibility'] = 0.8
            effects['movement_speed'] = 0.9
        elif self.current_weather == WeatherType.SNOW:
            effects['visibility'] = 0.7
            effects['movement_speed'] = 0.7
        elif self.current_weather == WeatherType.FOG:
            effects['visibility'] = 0.5
        elif self.current_weather == WeatherType.STORM:
            effects['visibility'] = 0.6
            effects['movement_speed'] = 0.8
            effects['lightning_damage'] = True
        return effects

class DayNightCycle:
    def __init__(self, day_length: float = 1200):
        self.time_of_day = 0  # 0 to day_length
        self.day_length = day_length
        self.dawn = day_length * 0.2
        self.dusk = day_length * 0.7

    def update(self, dt: float):
        self.time_of_day = (self.time_of_day + dt) % self.day_length

    def is_day(self) -> bool:
        return self.dawn < self.time_of_day < self.dusk

    def is_night(self) -> bool:
        return not self.is_day()

    def get_light_level(self) -> float:
        if self.time_of_day < self.dawn:
            # Night to dawn
            return 0.3 + (self.time_of_day / self.dawn) * 0.7
        elif self.time_of_day < self.dusk:
            # Day
            return 1.0
        else:
            # Dusk to night
            progress = (self.time_of_day - self.dusk) / (self.day_length - self.dusk)
            return 1.0 - (progress * 0.7)

""")

# Add 10 pet companions
for pet_num in range(10):
    pet_types = ['Wolf', 'Cat', 'Dragon', 'Phoenix', 'Bear']
    pet_type = pet_types[pet_num % 5]

    ULTRA_MASSIVE_GAME.append(f"""
# === PET COMPANION #{pet_num+1} ===
class PetCompanion{pet_num}:
    def __init__(self):
        self.name = 'Pet_{pet_num}'
        self.pet_type = '{pet_type}'
        self.level = 1
        self.experience = 0
        self.exp_to_level = 50

        # Stats
        self.health = {30 + pet_num * 10}
        self.max_health = {30 + pet_num * 10}
        self.damage = {5 + pet_num * 2}
        self.speed = {100 + pet_num * 10}
        self.loyalty = 50  # 0-100

        # Abilities
        self.abilities = []
        if self.pet_type == 'Wolf':
            self.abilities = ['Howl', 'Pack_Leader', 'Feral_Bite']
        elif self.pet_type == 'Dragon':
            self.abilities = ['Fire_Breath', 'Wing_Buffet', 'Intimidate']
        elif self.pet_type == 'Phoenix':
            self.abilities = ['Rebirth', 'Flame_Aura', 'Healing_Fire']

        self.active_ability = None
        self.position = Vector2D(0, 0)

    def follow_owner(self, owner, dt: float):
        distance = self.position.distance_to(owner.position)
        if distance > 100:
            direction = (owner.position - self.position).normalize()
            self.position = self.position + (direction * self.speed * dt)

    def attack(self, target):
        damage = self.damage + (self.level * 2)
        target.take_damage(damage)
        return damage

    def use_ability(self, ability_name, owner):
        if ability_name in self.abilities:
            if ability_name == 'Howl':
                owner.stats.attack_damage += 5
                return 'Howl increases damage!'
            elif ability_name == 'Fire_Breath':
                return 'Breathes fire for massive damage!'
            elif ability_name == 'Rebirth':
                if owner.health <= 0:
                    owner.health = owner.max_health * 0.5
                    return 'Phoenix revives owner!'

    def gain_experience(self, amount: int):
        self.experience += amount
        while self.experience >= self.exp_to_level:
            self.level_up()

    def level_up(self):
        self.level += 1
        self.experience -= self.exp_to_level
        self.exp_to_level = int(self.exp_to_level * 1.4)
        self.max_health += 5
        self.health = self.max_health
        self.damage += 2

    def increase_loyalty(self, amount: int):
        self.loyalty = min(100, self.loyalty + amount)

""")

# Add 5 faction systems
for faction_num in range(5):
    faction_names = ['The Alliance', 'The Horde', 'The Council', 'The Brotherhood', 'The Order']
    faction_name = faction_names[faction_num]

    ULTRA_MASSIVE_GAME.append(f"""
# === FACTION #{faction_num+1} ===
class Faction{faction_num}:
    def __init__(self):
        self.name = '{faction_name}'
        self.description = 'A powerful faction in the realm'
        self.reputation_levels = {{
            'Hated': -6000,
            'Hostile': -3000,
            'Unfriendly': -500,
            'Neutral': 0,
            'Friendly': 3000,
            'Honored': 9000,
            'Revered': 21000,
            'Exalted': 42000
        }}
        self.current_reputation = 0
        self.current_level = 'Neutral'

        # Faction rewards by reputation level
        self.rewards = {{
            'Friendly': [GameItem{{faction_num * 10}}()],
            'Honored': [GameItem{{faction_num * 10 + 1}}(), GameItem{{faction_num * 10 + 2}}()],
            'Revered': [GameItem{{faction_num * 10 + 3}}()],
            'Exalted': [GameItem{{faction_num * 10 + 4}}()]
        }}

        # Faction vendors
        self.vendors = [NPC{{faction_num * 5 + i}}(0, 0) for i in range(3)]

        # Allied and enemy factions
        self.allies = []
        self.enemies = []

    def gain_reputation(self, amount: int):
        self.current_reputation += amount
        self.update_reputation_level()

    def lose_reputation(self, amount: int):
        self.current_reputation -= amount
        # Losing rep with one faction gains rep with enemies
        for enemy_faction in self.enemies:
            enemy_faction.gain_reputation(amount // 2)
        self.update_reputation_level()

    def update_reputation_level(self):
        for level_name, threshold in sorted(self.reputation_levels.items(), key=lambda x: x[1], reverse=True):
            if self.current_reputation >= threshold:
                if self.current_level != level_name:
                    self.current_level = level_name
                    print(f'Reputation with {{self.name}} is now {{level_name}}!')
                    self.grant_level_rewards(level_name)
                break

    def grant_level_rewards(self, level_name: str):
        if level_name in self.rewards:
            print(f'New rewards available from {{self.name}}!')

    def can_access_vendor(self, vendor_index: int) -> bool:
        required_levels = ['Neutral', 'Friendly', 'Honored']
        if vendor_index < len(required_levels):
            required = self.reputation_levels[required_levels[vendor_index]]
            return self.current_reputation >= required
        return False

""")

# Add closing main game loop
ULTRA_MASSIVE_GAME.append("""
# === MAIN GAME EXECUTION ===
if __name__ == '__main__':
    print("Starting Epic Adventure Game...")
    print("Initializing game systems...")
    print("Loading assets...")
    print("Creating world...")
    print("Game ready!")
    print("Press any key to begin your adventure...")

    # Game would start here
    # game = AdventureGame()
    # game.run()

""")

def type_ultra_slow_game(typing_speed=0.15, pause_between=10):
    """
    Types 5000+ lines over ~100 HOURS!

    Args:
        typing_speed: 0.15s per character = ULTRA SLOW
        pause_between: 10 seconds between sections
    """
    print("=" * 70)
    print("ULTRA SLOW MASSIVE GAME TYPER - 100+ HOUR EDITION")
    print("=" * 70)
    print("\nESTIMATED COMPLETION TIME: 48-129 HOURS (depends on speed)")
    print("\nINCLUDES:")
    print("   - Complete game engine")
    print("   - 100 enemies, 100 items, 50 quests, 30 NPCs, 20 dungeons")
    print("   - 20 spells with elemental effects")
    print("   - 15 crafting recipes (Blacksmithing/Alchemy/Enchanting)")
    print("   - 15 achievements with rewards")
    print("   - Weather system & day/night cycle")
    print("   - 10 pet companions with abilities")
    print("   - 5 faction systems with reputation")
    print("   - Advanced AI, combat, quest & dialogue systems")
    print(f"\nTotal code sections: {len(ULTRA_MASSIVE_GAME)}")
    print("Estimated total lines: ~11,600")
    print(f"\n⏱️  Typing speed: {typing_speed}s per character (ULTRA SLOW)")
    print(f"⏸️  Pause between sections: {pause_between}s")
    print("\nSAFETY:")
    print("   - Click in your code editor in 10 seconds!")
    print("   - Move mouse to TOP-LEFT CORNER to STOP")
    print("   - Press Ctrl+C in terminal to emergency stop")
    print("\nTIP: This will run for DAYS. Make sure:")
    print("   - Your computer won't sleep")
    print("   - You have power backup")
    print("   - The window stays focused")
    print("\nBuilding the ULTIMATE adventure game...")
    print("\nStarting in 10 seconds...")
    time.sleep(10)

    snippet_count = 0
    total_lines = 0
    total_chars = 0
    start_time = time.time()

    try:
        for code in ULTRA_MASSIVE_GAME:
            snippet_count += 1
            lines = code.count('\n')
            chars = len(code)
            total_lines += lines
            total_chars += chars

            elapsed = time.time() - start_time
            estimated_total = total_chars * typing_speed
            estimated_remaining = estimated_total - elapsed

            print(f"\nSection {snippet_count}/{len(ULTRA_MASSIVE_GAME)}")
            print(f"   Lines: {lines} | Total: {total_lines}")
            print(f"   Chars: {chars} | Total: {total_chars}")
            print(f"   Elapsed: {elapsed/3600:.1f}h | Remaining: ~{estimated_remaining/3600:.1f}h")

            for i, char in enumerate(code):
                pyautogui.write(char, interval=0)

                if char == '\n':
                    delay = 0.5  # Extra pause at newlines
                else:
                    delay = typing_speed + random.uniform(-0.02, 0.02)

                time.sleep(delay)

                # Progress update every 100 chars
                if i % 100 == 0:
                    progress = (i / len(code)) * 100
                    print(f"   Progress: {progress:.1f}% of current section", end='\r')

            print(f"\n   Pausing {pause_between}s before next section...")
            time.sleep(pause_between)

        total_time = time.time() - start_time
        print(f"\nCOMPLETE! Typed {total_lines} lines in {total_time/3600:.1f} hours!")

    except pyautogui.FailSafeException:
        total_time = time.time() - start_time
        print("\n\nSTOPPED! (Mouse moved to corner)")
        print(f"Typed {snippet_count}/{len(ULTRA_MASSIVE_GAME)} sections")
        print(f"{total_lines} lines, {total_chars} characters")
        print(f"Runtime: {total_time/3600:.2f} hours")
    except KeyboardInterrupt:
        total_time = time.time() - start_time
        print("\n\nSTOPPED! (Ctrl+C pressed)")
        print(f"Typed {snippet_count}/{len(ULTRA_MASSIVE_GAME)} sections")
        print(f"{total_lines} lines, {total_chars} characters")
        print(f"Runtime: {total_time/3600:.2f} hours")

def main():
    print("\n" + "="*70)
    print("ULTRA SLOW ADVENTURE GAME TYPER")
    print("="*70)

    print("\nWARNING: This will take approximately 48-129 HOURS to complete!")
    print("Only proceed if you:")
    print("  - Want to run this for multiple days")
    print("  - Have configured your PC to never sleep")
    print("  - Are okay with your keyboard being automated for a LONG time")

    confirm = input("\nType 'YES' to proceed: ")
    if confirm.upper() != 'YES':
        print("Cancelled. Use massive-game-typer.py for faster typing.")
        return

    print("\n\nTyping speed presets:")
    print("  1 = INSANELY SLOW (0.8s/char) - ~100 hours")
    print("  2 = Extreme Slow (0.5s/char) - ~65 hours")
    print("  3 = Ultra Slow (0.3s/char) - ~39 hours")
    print("  4 = Very Slow (0.15s/char) - ~20 hours")
    print("  5 = Slow (0.08s/char) - ~10 hours")

    speed_choice = input("\nSpeed [1 for 100 hours]: ").strip()
    speed_map = {"1": 0.8, "2": 0.5, "3": 0.3, "4": 0.15, "5": 0.08}
    speed = speed_map.get(speed_choice, 0.8)

    pause = input("Seconds between sections [10]: ").strip()
    pause = float(pause) if pause else 10.0

    total_chars = 11600 * 50  # 11,600 lines * 50 chars avg
    hours = (total_chars * speed) / 3600
    print(f"\n\nEstimated time: ~{hours:.0f} hours")
    print("\nStarting ultra-slow typing marathon!")
    type_ultra_slow_game(speed, pause)

if __name__ == "__main__":
    pyautogui.FAILSAFE = True
    main()
