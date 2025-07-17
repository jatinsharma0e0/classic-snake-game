#!/usr/bin/env python3
"""
Proper sprite sheet slicer for the Greeny Snake game.
This script slices the sprite sheet according to the correct grid positions.
"""

from PIL import Image
import os

def slice_sprite_sheet():
    # Load the sprite sheet
    sprite_sheet = Image.open('attached_assets/greeny-sprite-sheet_1752753513665.jpg')
    
    # Calculate cell dimensions (5 columns, 4 rows)
    width, height = sprite_sheet.size
    cell_width = width // 5
    cell_height = height // 4
    
    print(f"Sprite sheet size: {width}x{height}")
    print(f"Cell size: {cell_width}x{cell_height}")
    
    # Create output directories
    os.makedirs('assets/snakes/greeny', exist_ok=True)
    os.makedirs('assets/food/apple', exist_ok=True)
    
    # Sprite definitions based on your grid specifications
    sprites = {
        # Row 1 (0-indexed)
        (0, 0): ('body_turn_left_down', 'Body turn: left→down or up→right'),
        (0, 1): ('body_horizontal', 'Body horizontal: left↔right'),
        (0, 2): ('body_turn_up_left', 'Body turn: up→left or right→down'),
        (0, 3): ('head_up', 'Head facing up'),
        (0, 4): ('head_right', 'Head facing right'),
        
        # Row 2 (0-indexed)
        (1, 0): ('body_turn_down_right', 'Body turn: down→right or left→up'),
        (1, 1): None,  # Empty
        (1, 2): ('body_vertical', 'Body vertical: up↕down'),
        (1, 3): ('head_left', 'Head facing left'),
        (1, 4): ('head_down', 'Head facing down'),
        
        # Row 3 (0-indexed)
        (2, 0): None,  # Empty
        (2, 1): None,  # Empty
        (2, 2): ('body_turn_right_up', 'Body turn: right→up or down→left'),
        (2, 3): ('tail_up', 'Tail facing up'),
        (2, 4): ('tail_right', 'Tail facing right'),
        
        # Row 4 (0-indexed)
        (3, 0): ('apple', 'Apple'),
        (3, 1): None,  # Empty
        (3, 2): None,  # Empty
        (3, 3): ('tail_left', 'Tail facing left'),
        (3, 4): ('tail_down', 'Tail facing down'),
    }
    
    # Extract and save sprites
    for (row, col), sprite_info in sprites.items():
        if sprite_info is None:
            continue
            
        sprite_name, description = sprite_info
        
        # Calculate crop coordinates
        left = col * cell_width
        top = row * cell_height
        right = left + cell_width
        bottom = top + cell_height
        
        # Extract the sprite
        sprite = sprite_sheet.crop((left, top, right, bottom))
        
        # Save to appropriate directory
        if sprite_name == 'apple':
            file_path = f'assets/food/apple/{sprite_name}.png'
        else:
            file_path = f'assets/snakes/greeny/{sprite_name}.png'
            
        sprite.save(file_path)
        print(f"Saved: {file_path} - {description}")
    
    print("\nSprite slicing completed!")

if __name__ == "__main__":
    slice_sprite_sheet()