import React, { useState } from 'react'
import { GitBranch, Plus, Trash2 } from 'lucide-react'

interface Node {
  id: string
  text: string
  children: Node[]
}

const MindMapNode: React.FC<{ node: Node; onAdd: (id: string) => void; onDelete: (id: string) => void; onEdit: (id: string, text: string) => void }> = ({ node, onAdd, onDelete, onEdit }) => {
  return (
    <div className="mb-2">
      <div className="flex items-center mb-1">
        <input
          type="text"
          value={node.text}
          onChange={(e) => onEdit(node.id, e.target.value)}
          className="mr-2 px-2 py-1 border rounded"
        />
        <button onClick={() => onAdd(node.id)} className="mr-1 p-1 bg-green-500 text-white rounded hover:bg-green-600">
          <Plus size={16} />
        </button>
        <button onClick={() => onDelete(node.id)} className="p-1 bg-red-500 text-white rounded hover:bg-red-600">
          <Trash2 size={16} />
        </button>
      </div>
      <div className="pl-4 border-l-2 border-gray-300">
        {node.children.map(child => (
          <MindMapNode key={child.id} node={child} onAdd={onAdd} onDelete={onDelete} onEdit={onEdit} />
        ))}
      </div>
    </div>
  )
}

const MindMapMakerPage: React.FC = () => {
  const [rootNode, setRootNode] = useState<Node>({ id: '0', text: 'Central Idea', children: [] })

  const addNode = (parentId: string) => {
    const newNode: Node = { id: Date.now().toString(), text: 'New Idea', children: [] }
    setRootNode(prevRoot => {
      const updateChildren = (node: Node): Node => {
        if (node.id === parentId) {
          return { ...node, children: [...node.children, newNode] }
        }
        return { ...node, children: node.children.map(updateChildren) }
      }
      return updateChildren(prevRoot)
    })
  }

  const deleteNode = (id: string) => {
    setRootNode(prevRoot => {
      const updateChildren = (node: Node): Node => {
        return {
          ...node,
          children: node.children.filter(child => child.id !== id).map(updateChildren)
        }
      }
      return id === '0' ? prevRoot : updateChildren(prevRoot)
    })
  }

  const editNode = (id: string, text: string) => {
    setRootNode(prevRoot => {
      const updateNode = (node: Node): Node => {
        if (node.id === id) {
          return { ...node, text }
        }
        return { ...node, children: node.children.map(updateNode) }
      }
      return updateNode(prevRoot)
    })
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <GitBranch className="mr-2" /> Mind Map Maker
        </h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <MindMapNode node={rootNode} onAdd={addNode} onDelete={deleteNode} onEdit={editNode} />
        </div>
      </div>
    </div>
  )
}

export default MindMapMakerPage